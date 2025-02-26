import { BoxBufferGeometry, BoxHelper, Mesh, Object3D } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SpawnPointComponent } from '../../components/SpawnPointComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

export const SCENE_COMPONENT_SPAWN_POINT = 'spawn-point'
export const SCENE_COMPONENT_SPAWN_POINT_DEFAULT_VALUES = {}

// TODO: add circle option
let spawnPointHelperModel: Object3D = null!
const GLTF_PATH = '/static/editor/spawn-point.glb' // Static

export const deserializeSpawnPoint: ComponentDeserializeFunction = async (entity: Entity) => {
  addComponent(entity, SpawnPointComponent, {})

  let obj3d: Object3D = null!
  if (hasComponent(entity, Object3DComponent)) {
    obj3d = getComponent(entity, Object3DComponent).value
  } else {
    obj3d = new Object3D()
    addComponent(entity, Object3DComponent, { value: obj3d })
  }

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SPAWN_POINT)

    if (!spawnPointHelperModel) {
      const { scene } = await AssetLoader.loadAsync({ url: GLTF_PATH })
      spawnPointHelperModel = scene
    }

    obj3d.userData.helperModel = spawnPointHelperModel.clone()
    obj3d.add(obj3d.userData.helperModel)
    obj3d.userData.helperBox = new BoxHelper(new Mesh(new BoxBufferGeometry(1, 0, 1).translate(0, 0, 0)), 0xffffff)
    obj3d.userData.helperBox.userData.isHelper = true
    obj3d.add(obj3d.userData.helperBox)

    setObjectLayers(obj3d.userData.helperModel, ObjectLayers.NodeHelper)
    setObjectLayers(obj3d.userData.helperBox, ObjectLayers.NodeHelper)
  }
}

export const serializeSpawnPoint: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, SpawnPointComponent)) {
    return {
      name: SCENE_COMPONENT_SPAWN_POINT,
      props: {}
    }
  }
}

export const prepareSpawnPointForGLTFExport: ComponentPrepareForGLTFExportFunction = (spawnPoint) => {
  if (spawnPoint.userData.helperModel) {
    if (spawnPoint.userData.helperModel.parent) spawnPoint.userData.helperModel.removeFromParent()
    delete spawnPoint.userData.helperModel
  }

  if (spawnPoint.userData.helperBox) {
    if (spawnPoint.userData.helperBox.parent) spawnPoint.userData.helperBox.removeFromParent()
    delete spawnPoint.userData.helperBox
  }
}
