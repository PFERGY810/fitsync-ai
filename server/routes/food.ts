import type { Express } from "express";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { foodEntries } from "@shared/schema";

export function registerFoodRoutes(app: Express) {
  // ============================================
  // Food API Endpoints (Barcode + Search + CRUD)
  // ============================================
  const USDA_NUTRIENT_IDS = {
    calories: 1008,
    protein: 1003,
    carbs: 1005,
    fat: 1004,
    fiber: 1079,
    sugar: 2000,
    sodium: 1093,
  };

  const getUsdaNutrientValue = (
    foodNutrients: any[] | undefined,
    nutrientId: number,
  ) => {
    if (!foodNutrients) return 0;
    const match = foodNutrients.find(
      (nutrient) =>
        nutrient?.nutrientId === nutrientId ||
        nutrient?.nutrient?.id === nutrientId,
    );
    const value = match?.value ?? match?.amount ?? 0;
    return typeof value === "number" ? value : 0;
  };

  const mapUsdaFoodToItem = (food: any) => {
    const servingSize = food?.servingSize || 100;
    const servingUnit = food?.servingSizeUnit || "g";
    const labelNutrients = food?.labelNutrients || null;
    const scale = labelNutrients ? 1 : servingSize / 100;

    const calories =
      labelNutrients?.calories?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.calories) *
        scale,
      );
    const protein =
      labelNutrients?.protein?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.protein) *
        scale *
        10,
      ) / 10;
    const carbs =
      labelNutrients?.carbohydrates?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.carbs) *
        scale *
        10,
      ) / 10;
    const fat =
      labelNutrients?.fat?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.fat) *
        scale *
        10,
      ) / 10;
    const fiber =
      labelNutrients?.fiber?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.fiber) *
        scale *
        10,
      ) / 10;
    const sugar =
      labelNutrients?.sugars?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.sugar) *
        scale *
        10,
      ) / 10;
    const sodium =
      labelNutrients?.sodium?.value ??
      Math.round(
        getUsdaNutrientValue(food?.foodNutrients, USDA_NUTRIENT_IDS.sodium) *
        scale *
        10,
      ) / 10;

    return {
      name: food?.description || "Unknown",
      brand: food?.brandOwner || food?.brandName || null,
      barcode: food?.gtinUpc || null,
      servingSize,
      servingUnit,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      imageUrl: food?.foodImages?.[0] || null,
      source: "usda",
      fdcId: food?.fdcId,
    };
  };

  const fetchUsdaFoodDetails = async (fdcId: number, apiKey: string) => {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`,
    );
    if (!response.ok) {
      throw new Error(`USDA details failed: ${response.status}`);
    }
    const food = await response.json();
    return mapUsdaFoodToItem(food);
  };

  // Barcode lookup via Open Food Facts (completely free, no API key required)
  app.get("/api/food/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      console.log("[Food API] Looking up barcode:", barcode);

      const usdaKey = process.env.USDA_FDC_API_KEY;
      if (usdaKey) {
        try {
          const usdaUrl = new URL(
            "https://api.nal.usda.gov/fdc/v1/foods/search",
          );
          usdaUrl.searchParams.set("api_key", usdaKey);
          usdaUrl.searchParams.set("query", barcode);
          usdaUrl.searchParams.set("dataType", "Branded");
          usdaUrl.searchParams.set("pageSize", "5");
          const usdaResponse = await fetch(usdaUrl.toString());

          if (usdaResponse.ok) {
            const usdaData = await usdaResponse.json();
            const foods = usdaData?.foods || [];
            const match =
              foods.find((food: any) => food?.gtinUpc === barcode) || foods[0];

            if (match?.fdcId) {
              try {
                const detailed = await fetchUsdaFoodDetails(
                  match.fdcId,
                  usdaKey,
                );
                console.log("[Food API] USDA barcode match:", detailed.name);
                return res.json(detailed);
              } catch (detailError) {
                console.error(
                  "[Food API] USDA details failed, using search result:",
                  detailError,
                );
                return res.json(mapUsdaFoodToItem(match));
              }
            }
          }
        } catch (usdaError) {
          console.error("[Food API] USDA barcode lookup error:", usdaError);
        }
      }

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          headers: {
            "User-Agent": "FitSyncAI/1.0 (https://fitsync.ai)",
          },
        },
      );

      if (!response.ok) {
        console.log(
          "[Food API] Open Food Facts returned status:",
          response.status,
        );
        return res.status(404).json({ error: "Product not found" });
      }

      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        return res.status(404).json({ error: "Product not found in database" });
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      // Extract nutrition per 100g and calculate per serving
      const servingSize = product.serving_quantity || 100;
      const servingUnit = product.serving_quantity_unit || "g";

      const foodItem = {
        name:
          product.product_name || product.product_name_en || "Unknown Product",
        brand: product.brands || null,
        barcode: barcode,
        servingSize: servingSize,
        servingUnit: servingUnit,
        calories:
          Math.round(nutriments["energy-kcal_100g"] * (servingSize / 100)) ||
          Math.round(nutriments["energy-kcal_serving"]) ||
          0,
        protein:
          Math.round(
            (nutriments.proteins_100g || 0) * (servingSize / 100) * 10,
          ) / 10,
        carbs:
          Math.round(
            (nutriments.carbohydrates_100g || 0) * (servingSize / 100) * 10,
          ) / 10,
        fat:
          Math.round((nutriments.fat_100g || 0) * (servingSize / 100) * 10) /
          10,
        fiber:
          Math.round((nutriments.fiber_100g || 0) * (servingSize / 100) * 10) /
          10,
        sugar:
          Math.round((nutriments.sugars_100g || 0) * (servingSize / 100) * 10) /
          10,
        sodium:
          Math.round(
            (nutriments.sodium_100g || 0) * (servingSize / 100) * 1000,
          ) / 10,
        imageUrl: product.image_small_url || product.image_url || null,
        source: "openfoodfacts",
      };

      res.json(foodItem);
    } catch (error) {
      console.error("[Food API] Barcode lookup error:", error);
      res.status(500).json({ error: "Failed to lookup barcode" });
    }
  });

  app.get("/api/food/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      if (!query || query.length < 2) {
        return res
          .status(400)
          .json({ error: "Query must be at least 2 characters" });
      }

      console.log("[Food API] Searching for:", query);

      const usdaKey = process.env.USDA_FDC_API_KEY;
      if (usdaKey) {
        try {
          const usdaUrl = new URL(
            "https://api.nal.usda.gov/fdc/v1/foods/search",
          );
          usdaUrl.searchParams.set("api_key", usdaKey);
          usdaUrl.searchParams.set("query", query);
          usdaUrl.searchParams.set("pageSize", pageSize.toString());
          usdaUrl.searchParams.set("pageNumber", page.toString());
          usdaUrl.searchParams.set("dataType", "Branded,Foundation,SR Legacy");
          const usdaResponse = await fetch(usdaUrl.toString());

          if (usdaResponse.ok) {
            const usdaData = await usdaResponse.json();
            const foods = (usdaData.foods || [])
              .map((food: any) => mapUsdaFoodToItem(food))
              .filter((food: any) => food.name && food.calories > 0);

            if (foods.length > 0) {
              console.log("[Food API] USDA results:", foods.length);
              return res.json({
                foods,
                page,
                pageSize,
                totalCount: usdaData.totalHits || foods.length,
              });
            }
          }
        } catch (usdaError) {
          console.error("[Food API] USDA search error:", usdaError);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`,
        {
          headers: {
            "User-Agent": "FitSyncAI/1.0 (https://fitsync.ai)",
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("[Food API] Search failed:", response.status);
        return res.status(500).json({ error: "Search failed" });
      }

      const data = await response.json();

      const foods = (data.products || [])
        .map((product: any) => {
          const nutriments = product.nutriments || {};
          const servingSize = product.serving_quantity || 100;

          return {
            name: product.product_name || product.product_name_en || "Unknown",
            brand: product.brands || null,
            barcode: product.code || null,
            servingSize: servingSize,
            servingUnit: product.serving_quantity_unit || "g",
            calories:
              Math.round(
                nutriments["energy-kcal_100g"] * (servingSize / 100),
              ) || 0,
            protein:
              Math.round(
                (nutriments.proteins_100g || 0) * (servingSize / 100) * 10,
              ) / 10,
            carbs:
              Math.round(
                (nutriments.carbohydrates_100g || 0) * (servingSize / 100) * 10,
              ) / 10,
            fat:
              Math.round(
                (nutriments.fat_100g || 0) * (servingSize / 100) * 10,
              ) / 10,
            fiber:
              Math.round(
                (nutriments.fiber_100g || 0) * (servingSize / 100) * 10,
              ) / 10,
            sugar:
              Math.round(
                (nutriments.sugars_100g || 0) * (servingSize / 100) * 10,
              ) / 10,
            sodium:
              Math.round(
                (nutriments.sodium_100g || 0) * (servingSize / 100) * 1000,
              ) / 10,
            imageUrl: product.image_small_url || product.image_url || null,
            source: "openfoodfacts",
          };
        })
        .filter((f: any) => f.name && f.name !== "Unknown" && f.calories > 0);

      console.log("[Food API] Found", foods.length, "results");
      res.json({
        foods,
        page,
        pageSize,
        totalCount: data.count || 0,
      });
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.error("[Food API] Request timed out");
        return res.status(504).json({ error: "Search timed out. Try again." });
      }
      console.error("[Food API] Search error:", error);
      res.status(500).json({ error: "Failed to search foods" });
    }
  });

  // Food details via USDA FoodData Central
  app.get("/api/food/details/:fdcId", async (req, res) => {
    try {
      const fdcId = Number(req.params.fdcId);
      if (!fdcId || Number.isNaN(fdcId)) {
        return res.status(400).json({ error: "Invalid fdcId" });
      }

      const usdaKey = process.env.USDA_FDC_API_KEY;
      if (!usdaKey) {
        return res.status(500).json({ error: "USDA API key not configured" });
      }

      const food = await fetchUsdaFoodDetails(fdcId, usdaKey);
      res.json(food);
    } catch (error) {
      console.error("[Food API] USDA details error:", error);
      res.status(500).json({ error: "Failed to fetch food details" });
    }
  });

  // Add food entry
  app.post("/api/food/entries", async (req, res) => {
    try {
      const { profileId, date, food, mealType, servings = 1 } = req.body;

      if (!profileId || !date || !food) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("[Food API] Adding food entry:", food.name, "for", date);

      const [entry] = await db
        .insert(foodEntries)
        .values({
          profileId,
          date,
          name: food.name,
          brand: food.brand || null,
          barcode: food.barcode || null,
          servingSize: food.servingSize || 100,
          servingUnit: food.servingUnit || "g",
          servings,
          calories: Math.round((food.calories || 0) * servings),
          protein: Math.round((food.protein || 0) * servings * 10) / 10,
          carbs: Math.round((food.carbs || 0) * servings * 10) / 10,
          fat: Math.round((food.fat || 0) * servings * 10) / 10,
          fiber: Math.round((food.fiber || 0) * servings * 10) / 10,
          sugar: Math.round((food.sugar || 0) * servings * 10) / 10,
          sodium: Math.round((food.sodium || 0) * servings * 10) / 10,
          mealType,
          source: food.source || "manual",
        })
        .returning();

      res.json(entry);
    } catch (error) {
      console.error("[Food API] Error adding entry:", error);
      res.status(500).json({ error: "Failed to add food entry" });
    }
  });

  // Get food entries for a date
  app.get("/api/food/entries/:profileId/:date", async (req, res) => {
    try {
      const { profileId, date } = req.params;

      const entries = await db
        .select()
        .from(foodEntries)
        .where(
          and(eq(foodEntries.profileId, profileId), eq(foodEntries.date, date)),
        )
        .orderBy(foodEntries.createdAt);

      // Calculate daily totals
      const totals = entries.reduce(
        (acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fat: acc.fat + (entry.fat || 0),
          fiber: acc.fiber + (entry.fiber || 0),
          sugar: acc.sugar + (entry.sugar || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
      );

      res.json({ entries, totals });
    } catch (error) {
      console.error("[Food API] Error fetching entries:", error);
      res.status(500).json({ error: "Failed to fetch food entries" });
    }
  });

  // Delete food entry
  app.delete("/api/food/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;

      await db.delete(foodEntries).where(eq(foodEntries.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("[Food API] Error deleting entry:", error);
      res.status(500).json({ error: "Failed to delete food entry" });
    }
  });

  // Quick add common foods (bodybuilding staples)
  app.get("/api/food/quick-add", async (req, res) => {
    const quickFoods = [
      {
        name: "Chicken Breast (cooked)",
        servingSize: 100,
        servingUnit: "g",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        source: "usda",
      },
      {
        name: "Egg (large)",
        servingSize: 50,
        servingUnit: "g",
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fat: 4.8,
        fiber: 0,
        sugar: 0.2,
        source: "usda",
      },
      {
        name: "Egg Whites (1 cup)",
        servingSize: 243,
        servingUnit: "g",
        calories: 126,
        protein: 26,
        carbs: 1.8,
        fat: 0.4,
        fiber: 0,
        sugar: 1.5,
        source: "usda",
      },
      {
        name: "White Rice (cooked)",
        servingSize: 158,
        servingUnit: "g",
        calories: 206,
        protein: 4.3,
        carbs: 45,
        fat: 0.4,
        fiber: 0.6,
        sugar: 0,
        source: "usda",
      },
      {
        name: "Brown Rice (cooked)",
        servingSize: 195,
        servingUnit: "g",
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        fiber: 3.5,
        sugar: 0.7,
        source: "usda",
      },
      {
        name: "Oatmeal (cooked)",
        servingSize: 234,
        servingUnit: "g",
        calories: 158,
        protein: 6,
        carbs: 27,
        fat: 3.2,
        fiber: 4,
        sugar: 1.1,
        source: "usda",
      },
      {
        name: "Sweet Potato (baked)",
        servingSize: 200,
        servingUnit: "g",
        calories: 180,
        protein: 4,
        carbs: 41,
        fat: 0.2,
        fiber: 6.6,
        sugar: 13,
        source: "usda",
      },
      {
        name: "Broccoli (steamed)",
        servingSize: 156,
        servingUnit: "g",
        calories: 55,
        protein: 3.7,
        carbs: 11,
        fat: 0.6,
        fiber: 5.1,
        sugar: 2.2,
        source: "usda",
      },
      {
        name: "Salmon (baked)",
        servingSize: 154,
        servingUnit: "g",
        calories: 367,
        protein: 39,
        carbs: 0,
        fat: 22,
        fiber: 0,
        sugar: 0,
        source: "usda",
      },
      {
        name: "Ground Beef 93% Lean",
        servingSize: 113,
        servingUnit: "g",
        calories: 170,
        protein: 23,
        carbs: 0,
        fat: 8,
        fiber: 0,
        sugar: 0,
        source: "usda",
      },
      {
        name: "Greek Yogurt (nonfat)",
        servingSize: 170,
        servingUnit: "g",
        calories: 100,
        protein: 17,
        carbs: 6,
        fat: 0.7,
        fiber: 0,
        sugar: 4,
        source: "usda",
      },
      {
        name: "Whey Protein (1 scoop)",
        servingSize: 30,
        servingUnit: "g",
        calories: 120,
        protein: 24,
        carbs: 3,
        fat: 1.5,
        fiber: 0,
        sugar: 1,
        source: "typical",
      },
      {
        name: "Almond Butter (2 tbsp)",
        servingSize: 32,
        servingUnit: "g",
        calories: 196,
        protein: 6.8,
        carbs: 6,
        fat: 18,
        fiber: 3.3,
        sugar: 2,
        source: "usda",
      },
      {
        name: "Avocado (medium)",
        servingSize: 150,
        servingUnit: "g",
        calories: 240,
        protein: 3,
        carbs: 13,
        fat: 22,
        fiber: 10,
        sugar: 1,
        source: "usda",
      },
      {
        name: "Banana (medium)",
        servingSize: 118,
        servingUnit: "g",
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3.1,
        sugar: 14,
        source: "usda",
      },
    ];

    res.json(quickFoods);
  });
}
