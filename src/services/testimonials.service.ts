import { createCrudService } from './crud.service';
import type {
    CreateTestimonialData,
    Testimonial,
    UpdateTestimonialData,
} from '../types/type';

export const TESTIMONIALS_TABLE = 'testimonials';

export const testimonialsService = createCrudService<
    Testimonial,
    CreateTestimonialData,
    UpdateTestimonialData
>({
    table: TESTIMONIALS_TABLE,
    labels: { one: 'du témoignage', many: 'des témoignages' },
});
