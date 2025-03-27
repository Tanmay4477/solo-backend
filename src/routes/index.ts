import { Router } from 'express';
// import authRoutes from './auth.routes';
// import userRoutes from './user.routes';
// import courseRoutes from './course.routes';
import moduleRoutes from './module.routes';
// import contentRoutes from './content.routes';
// import quizRoutes from './quiz.routes';
// import paymentRoutes from './payment.routes';
// import enrollmentRoutes from './enrollments.routes';
// import progressRoutes from './progress.routes';
// import certificateRoutes from './certificate.routes';
// import tagRoutes from './tag.routes';
// import postRoutes from './post.routes';
// import commentRoutes from './comment.routes';
// import serviceCategoryRoutes from './service-category.routes';
// import serviceRoutes from './service.routes';
// import serviceOrderRoutes from './service-order.routes';
// import notificationRoutes from './notification.routes';
// import uploadRoutes from './upload.routes';
// import adminRoutes from './admin.routes';

const router = Router();

// // API Routes
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
// router.use('/contents', contentRoutes);
// router.use('/quizzes', quizRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/enrollments', enrollmentRoutes);
// router.use('/progress', progressRoutes);
// router.use('/certificates', certificateRoutes);
// router.use('/tags', tagRoutes);
// router.use('/posts', postRoutes);
// router.use('/comments', commentRoutes);
// router.use('/service-categories', serviceCategoryRoutes);
// router.use('/services', serviceRoutes);
// router.use('/service-orders', serviceOrderRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/uploads', uploadRoutes);
// router.use('/admin', adminRoutes);

export default router;