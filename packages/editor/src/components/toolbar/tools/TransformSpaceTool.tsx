import React, { useEffect, useState } from 'react'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'

import LanguageIcon from '@mui/icons-material/Language'

import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import EditorEvents from '../../../constants/EditorEvents'
import { CommandManager } from '../../../managers/CommandManager'
import { SceneManager } from '../../../managers/SceneManager'
import { setTransformSpace, toggleTransformSpace } from '../../../systems/EditorControlSystem'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

/**
 *
 * @author Robert Long
 */
const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.LocalSelection },
  { label: 'World', value: TransformSpace.World }
]

const TransformSpaceTool = () => {
  const [transformSpace, changeTransformSpace] = useState(TransformSpace.World)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), updateTransformSpace)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), updateTransformSpace)
    }
  }, [])

  const updateTransformSpace = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    changeTransformSpace(editorControlComponent.transformSpace)
  }

  const onChangeTransformSpace = (transformSpace) => {
    setTransformSpace(transformSpace)
  }

  const onToggleTransformSpace = () => {
    toggleTransformSpace()
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip info="[Z] Toggle Transform Space">
        <button onClick={onToggleTransformSpace} className={styles.toolButton}>
          <LanguageIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeTransformSpace}
        options={transformSpaceOptions}
        value={transformSpace}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSpaceTool
