import { Router } from "express";
import PostController from "../controllers/post-controller";
import AuthenMiddleware from "../middlewares/authen-middleware";

const router= Router();

router.use(AuthenMiddleware.authenMiddleware);

router.get('/', PostController.getAllPost); // add user_id to check user liked post 
router.post('/',PostController.createPost);
router.post('/like', PostController.likePost);
router.get('/post-id/:post_id', PostController.getPostByPostId); // get post by post_id
router.get('/user-id/:user_id', PostController.getPostByUserId); // get post by user_id
router.put('/:post_id', PostController.updatePost);
router.delete('/:post_id', PostController.deletePost);

export default router;