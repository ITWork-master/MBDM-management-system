import { useCrud } from './useCrud';
import { testimonialsService } from '../services/testimonials.service';
import type {
    CreateTestimonialData,
    Testimonial,
    UpdateTestimonialData,
} from '../types/type';

const MESSAGES = {
    created: 'Témoignage ajouté.',
    updated: 'Témoignage modifié.',
    removed: 'Témoignage supprimé.',
};

export const useTestimonials = () =>
    useCrud<Testimonial, CreateTestimonialData, UpdateTestimonialData>(
        testimonialsService,
        MESSAGES,
    );
