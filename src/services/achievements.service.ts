import { createCrudService } from './crud.service';
import type {
    Achievement,
    CreateAchievementData,
    UpdateAchievementData,
} from '../types/type';

export const ACHIEVEMENTS_TABLE = 'achievements';

export const achievementsService = createCrudService<
    Achievement,
    CreateAchievementData,
    UpdateAchievementData
>({
    table: ACHIEVEMENTS_TABLE,
    labels: { one: "de l'intervention", many: 'des interventions' },
    hasImage: true,
});
