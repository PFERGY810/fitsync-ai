import type { Express } from "express";

type SearchResult = {
  name: string;
  source: string;
  metadata?: Record<string, string>;
};

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function normalizeName(name: string) {
  return name.trim();
}

export function registerMedicalRoutes(app: Express) {
  app.get("/api/medications/search", async (req, res) => {
    try {
      const query = String(req.query.q || "").trim();
      if (!query) {
        return res.json({ results: [] });
      }

      const results = new Map<string, SearchResult>();

      try {
        const rxUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(
          query,
        )}`;
        const rxData = await fetchJson(rxUrl);
        const conceptGroups = rxData?.drugGroup?.conceptGroup || [];
        for (const group of conceptGroups) {
          const concepts = group.conceptProperties || [];
          for (const concept of concepts) {
            if (!concept?.name) continue;
            const name = normalizeName(concept.name);
            results.set(name.toLowerCase(), {
              name,
              source: "rxnorm",
            });
          }
        }
      } catch (error) {
        console.error("RxNorm lookup failed:", error);
      }

      try {
        const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(
          query,
        )}+openfda.brand_name:${encodeURIComponent(query)}&limit=10`;
        const fdaData = await fetchJson(fdaUrl);
        const entries = fdaData?.results || [];
        for (const entry of entries) {
          const genericNames = entry?.openfda?.generic_name || [];
          const brandNames = entry?.openfda?.brand_name || [];
          const combined = [...genericNames, ...brandNames];
          for (const name of combined) {
            const clean = normalizeName(name);
            results.set(clean.toLowerCase(), {
              name: clean,
              source: "openfda",
            });
          }
        }
      } catch (error) {
        console.error("OpenFDA lookup failed:", error);
      }

      const sorted = Array.from(results.values()).slice(0, 20);
      res.json({ results: sorted });
    } catch (error) {
      console.error("Medication search error:", error);
      res.status(500).json({ error: "Failed to search medications" });
    }
  });

  app.get("/api/compounds/search", async (req, res) => {
    try {
      const query = String(req.query.q || "").trim();
      if (!query) {
        return res.json({ results: [] });
      }

      const results = new Map<string, SearchResult>();

      try {
        const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
          query,
        )}/property/Title,MolecularFormula,MolecularWeight/JSON`;
        const data = await fetchJson(pubchemUrl);
        const props = data?.PropertyTable?.Properties || [];
        for (const prop of props) {
          if (!prop?.Title) continue;
          const name = normalizeName(prop.Title);
          results.set(name.toLowerCase(), {
            name,
            source: "pubchem",
            metadata: {
              formula: prop.MolecularFormula || "",
              weight: prop.MolecularWeight ? String(prop.MolecularWeight) : "",
            },
          });
        }
      } catch (error) {
        console.error("PubChem lookup failed:", error);
      }

      const sorted = Array.from(results.values()).slice(0, 15);
      res.json({ results: sorted });
    } catch (error) {
      console.error("Compound search error:", error);
      res.status(500).json({ error: "Failed to search compounds" });
    }
  });
}
