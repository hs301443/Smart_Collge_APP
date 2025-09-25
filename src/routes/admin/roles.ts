import {Router} from "express";
import {createRoleWithActions, deleteRole, getRoles, getRoleById, updateRole} from "../../controller/admin/permission";
import {validate} from "../../middlewares/validation";
import {authenticated} from "../../middlewares/authenticated";

const router = Router();

router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', createRoleWithActions);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router