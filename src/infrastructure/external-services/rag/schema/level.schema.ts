import z from "zod";
import { LEVEL_DIFFICULTY } from "../../../../shared/constants/index";

export const RawLevelSchema = z.object({
    level: z.number(),
    world: z.string(),
    objective: z.string(),
    target: z.number(),
    unit: z.string(),
    xp: z.number(),
    reward: z.string(),
    difficulty: z.enum([
        LEVEL_DIFFICULTY.EASY,
        LEVEL_DIFFICULTY.MEDIUM,
        LEVEL_DIFFICULTY.HARD,
    ]),
    unlockRequirement: z.string(),
});

