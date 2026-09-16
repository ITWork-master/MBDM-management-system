import { useCrud } from './useCrud';
import { achievementsService } from '../services/achievements.service';
import type {
    Achievement,
    CreateAchievementData,
    UpdateAchievementData,
} from '../types/type';

const MESSAGES = {
    created: 'Intervention ajoutée.',
    updated: 'Intervention modifiée.',
    removed: 'Intervention supprimée.',
};

export const useAchievements = () =>
    useCrud<Achievement, CreateAchievementData, UpdateAchievementData>(
        achievementsService,
        MESSAGES,
    );
