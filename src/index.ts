import { Node, config } from "./lib/config";
import Express from "express";
const PORT = config.port ?? 3002;
const nodes: Node[] = config.nodes;

const app = Express();

app.get("/status", async (req, res) => {
    const statuses: Promise<any>[] = [];
    for (const node of nodes) {
        const promise = new Promise<any>((resolve, _) => {
            fetch(new URL("/health", node.location))
                .then(async (healthRes) => {
                    if (healthRes.ok) {
                        return resolve({
                            name: node.name,
                            health: await healthRes.json(),
                        });
                    } else {
                        console.log(
                            "[GetStatus]",
                            node.name,
                            node.location,
                            healthRes.status
                        );
                        return resolve({
                            name: node.name,
                            error: true,
                        });
                    }
                })
                .catch((err) => {
                    console.log("[GetStatus]", node.name, node.location);
                    console.log(err);
                    return resolve({
                        name: node.name,
                        err: true,
                    });
                });
        });

        statuses.push(promise);
    }

    return res.json(await Promise.all(statuses));
});

app.listen(PORT, () => {
    console.log("[EXPRESS] Listening on", PORT);
});
