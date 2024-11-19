const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Auth Routes
router.post('/auth/login', require('../controllers/auth/login'));
router.post('/auth/register', require('../controllers/auth/register'));
router.post('/auth/logout', require('../controllers/auth/logout'));
router.post('/auth/refresh-token', require('../controllers/auth/refreshToken'));

// Dreams Routes
router.get('/dreams', authMiddleware, require('../controllers/dreams/list'));
router.post('/dreams', authMiddleware, require('../controllers/dreams/create'));
router.get('/dreams/:id', authMiddleware, require('../controllers/dreams/get'));
router.put('/dreams/:id', authMiddleware, require('../controllers/dreams/update'));
router.delete('/dreams/:id', authMiddleware, require('../controllers/dreams/delete'));

// Dream Analysis Routes
router.post('/dreams/:id/analyze', authMiddleware, require('../controllers/dreams/analyze'));
router.get('/dreams/:id/analysis', authMiddleware, require('../controllers/dreams/getAnalysis'));

// Profile Routes
router.get('/profile', authMiddleware, require('../controllers/profile/get'));
router.put('/profile', authMiddleware, require('../controllers/profile/update'));
router.put('/profile/password', authMiddleware, require('../controllers/profile/updatePassword'));

// Settings Routes
router.get('/settings', authMiddleware, require('../controllers/settings/get'));
router.put('/settings', authMiddleware, require('../controllers/settings/update'));
router.put('/settings/notifications', authMiddleware, require('../controllers/settings/updateNotifications'));
router.put('/settings/privacy', authMiddleware, require('../controllers/settings/updatePrivacy'));

// Community Routes
router.get('/community/discussions', authMiddleware, require('../controllers/community/listDiscussions'));
router.post('/community/discussions', authMiddleware, require('../controllers/community/createDiscussion'));
router.get('/community/discussions/:id', authMiddleware, require('../controllers/community/getDiscussion'));
router.get('/community/members', authMiddleware, require('../controllers/community/listMembers'));
router.get('/community/members/:id', authMiddleware, require('../controllers/community/getMember'));

module.exports = router;
