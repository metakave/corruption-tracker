
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    {
        id: "73961f38-5c90-4fef-b900-b4f463e89019",
        date: "2026-01-19T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFNR5qf5_f3_17gDIEdqNOaXurLfo3wFsGO6FbuvoSnVYOs8BVdyrf_prh8iyNpyPxVDZy0OQFWD45ztbC9g8OjQ8_6cEbclcsYmjA_Jy4EpDUD9cTzM_P8Xus4qtj64bY-yycyw_DbSaGlPVtNTjBhSXxY",
        source: "Prothom Alo"
    },
    {
        id: "09d8eef3-355f-4190-be0f-39a3f9d83561",
        date: "2026-01-23T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQESmln9hN6kOdkghbi7uXBhfQOwTBeMaw6Kd_-Xb9CZ5TYnzUx-rRfKLc3hcvZFi6h2XuwWAhwcxXO49um2BE-VH7x-BSYQjt5_pkKCguSMDVgH8Z7wJrNVsQCvRh21izjXRO2NQ__WnRV752v_O_o3qlElCDosWgDl",
        source: "Somoyerkonthosor"
    },
    {
        id: "08d713cb-7d46-447f-a004-44b8b318e28a",
        date: "2026-01-31T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEQazMqSvC24t1PDbNotRIxP9Eo7IfmuX0bq_yfxVruojqEh_ZsMa94LwWYXtxP3jUVLhYJ8sMksZqiV50pZgH3PbBQM7Zuk1yfClkCUcm5fKceMAlf-1exhi8CJgYCWJmaAo-VvfmF27I7JQ==",
        source: "Padma Tribune"
    },
    {
        id: "b56056be-8088-48c8-95f6-67069cc92d0d",
        date: "2026-01-04T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEa3KNNgUh_L7cd2pGk9D7HhQI0v00SVAJV2sxYM8gzsuLHFt2x7_gQ6OT8JqUv5Enk4K1T_U5YaoYn0AhoLgTcZqXkHq5ul0GA02iStsmMxhiNvyYnXrgM112ALosPriW1OSJFqhM2K4mz",
        source: "Jago News"
    },
    {
        id: "f6499145-6aae-4050-8385-c756d40b0746",
        date: "2026-02-02T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEZHccto75yYQQBIhEHG2UbmsA3AA66emae1NVeJFwmMUEsqLxVBslaKBz-ehPAPkw2qgC3m-Cpa-WW3uYHUURQLBX4RVVvXvFfz67OpU6kPGZWPWP_HrMDDipbMuOgHfyxP6GLvTqEGNSlGxyum-cqi4PdNA==",
        source: "Prothom Alo"
    },
    {
        id: "39d6a5c2-8a12-4582-9844-caee650965e4",
        date: "2026-01-30T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFYAgT9OswtWCA7C8f9ya1Mt_cgDF3RaVIOcHKtje6mbqsm27sB7Idkmb-GpYmKuup3LjD59kxRmrV4raitByk5rVoggai9QORYNeWpxCGKQL8J9zuKkQBNA_zSvUrtkoaNE9A8laNU8z3kS2JBx4VNWwLB",
        source: "Prothom Alo"
    },
    {
        id: "7c6b15c4-f77a-40fd-bec8-c7ee638a25d3",
        date: "2026-01-04T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGZRSwFG46GB0GuSDGe8Fbf3e7uy8SCH9uu5wB6JwPZyv8SPyEQiQr0S_8nciKwtqENc7ZUy6yGKzRJFHYjW5U1-kAodASACJnq3vohl9OOEbBf819_bW11A9LoxF3tdFjam4ADOhvq2MB7f2yiPCxC8tOg",
        source: "Prothom Alo"
    },
    {
        id: "12095bd8-aae8-4996-afe0-d59868e8b44d",
        date: "2026-01-31T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFXslooMsnXyGjRjxTuo1He8z8rTgyzw4V4kAcfGNFFDO9BV-Q4Nc9pxi8KojONiUNv05q6_KaDlUaCVROFGldx2-Q1etAubDqEgbKfbEe_WO3L4f0W7lGD38wPIeTEA7uD1IamYh4Dww==",
        source: "Jugantor"
    },
    {
        id: "be2d6740-7f01-4a9c-9132-569006a70b76",
        date: "2025-12-29T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFF5Nj_gZPN6oAia4FiW63hXKZU7-BnUI9xC6tg2jMVa33UsGDhEfpoQTY70csonk1zPFkUJ1k94UTPhZGGpDmtNFjLrccUx17TKazMzu-kCzu5ayfdSxAPuHx2sNsMxyeCWTiHVmBAO24O1KrZfhXlS5o3jWQp99Ju8Dv5t65pkqv2Ht199HfSH34C9mV7RFRcQJxY00-CBoU8oxQBPfA_TxQ=",
        source: "Dhaka Tribune"
    },
    {
        id: "6a6a6e5a-e4eb-4803-af97-bc83c9e8eec7",
        date: "2026-01-27T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF5jxTtTjaZRXpffJKnF2tzJwwqjRj5xea0LU2t9HWGGiSKVZalibqYeVIwICPGYasOUIBJyFGgcWvuAOK6cZLQxg9f7Igl4sy6qAcrDoUGvz9hWLFZvhMiMsTx-TaVQMtjE34rVNd2fKDxAjIr1A==",
        source: "Ajker Patrika"
    },
    {
        id: "490fb700-eec3-4ef4-8ec1-ab2f50d1a450",
        date: "2026-01-25T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFMMfh6AEXHL--6i9aXWpkQqs94wIljPIbeIS9iOk_t6ewCBWWyE7UsLnnEAndtCO13hReKxs8xFovNmZZreA48-NEc4JSbmeOrUAGLlwZ9346nQAgA7wJAZ_UtQZ_U3Cc8",
        source: "BD24Live"
    },
    {
        id: "60b567e2-6cb3-47f8-843d-dcb57e8eff5b",
        date: "2026-02-03T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHQJWQ-fdRVP4sTH7itlvRUSTaC7bBeK3RSjLHt0R8DV894b68F5hXkEK1txfeAw9m_7pLsqvK7rFDM-OjSWj0IMhiHLV3_WXBHwrFQiaeKEqHsFUwWnaeYHqdsAGF2Dh2x4rs5mZ6gzn_PE3bz7OaBGPz8T9niBmGBwZzsRqxI7naU4_JLg7aZaIrrNKr2vAM9_OZOI5Loxi38ynegSiA1ezJg_20ZGKCH2YHL9KXqA-I-a9JQcTn9cJctoqaD-fPUoBCI5XrWSysP6IQyDyZOSQLFnjmKOrT-Sgg8BhQggbqWdwfz11t4VheNNxd_ZR2HMGlqybMt0ACEnejHE_3qtV4tf_Dc6lnJYiiQzEyRi42vTqn2fDscYpQI8qRIz6vshRc2BscYF4LZn-0rRVFSwnV6pNztSrsZby5LpXfG9noPomk6V47EH3y8SATT112ZaKGwHGLKBfUomSs9NvVYIK9cJYdLfBJ01kB2OTSynJmQrGUpHWF0Ql58batPxoJ-6K_dixrglu7T",
        source: "Ittefaq"
    },
    {
        id: "d34eb2f5-805a-4994-bd19-fcc6e17ec16e",
        date: "2026-01-16T00:00:00.000Z",
        url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEF7PJFjiLGydvCRPKcjte10YhJkLP7-ryuiSDnDFRKXPxHOLybGCuE9Lx98CMEjOobDmtsTY63M8YxId6knI_3UGTGTRgfHXD4dRsMXMNWWBxmfsQGAywoXdx3ySVZLrfGm6exnGZHz1gKOg==",
        source: "Jago News"
    }
];

async function main() {
    console.log(`Starting update for ${updates.length} events...`);

    for (const update of updates) {
        try {
            await prisma.politicalEvent.update({
                where: { id: update.id },
                data: {
                    dateOfIncident: new Date(update.date),
                    url: update.url,
                    source: update.source
                }
            });
            console.log(`Updated ${update.id} -> ${update.date} | ${update.source}`);
        } catch (e) {
            console.error(`Failed to update ${update.id}:`, e);
        }
    }
    console.log("Update complete.");
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
