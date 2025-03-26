import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  issueCertificate,
  getCertificates,
  getCertificateById,
  getUserCertificates,
  verifyCertificate
} from '../controllers/certificate.controller';

const router = Router();

/**
 * @route POST /api/v1/certificates
 * @desc Issue a new certificate
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, issueCertificate);

/**
 * @route GET /api/v1/certificates
 * @desc Get all certificates (admin only)
 * @access Private/Admin
 */
router.get('/', authenticate, adminOnly, getCertificates);

/**
 * @route GET /api/v1/certificates/:id
 * @desc Get certificate by ID
 * @access Private
 */
router.get('/:id', authenticate, getCertificateById);

/**
 * @route GET /api/v1/certificates/user/:userId
 * @desc Get all certificates for a user
 * @access Private
 */
router.get('/user/:userId', authenticate, getUserCertificates);

/**
 * @route GET /api/v1/certificates/verify/:code
 * @desc Verify certificate by verification code
 * @access Public
 */
router.get('/verify/:code', verifyCertificate);

export default router;