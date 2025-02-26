import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddIcon from '@mui/icons-material/Add'

import StringInput from '../inputs/StringInput'
import ProjectGridItem from './ProjectGridItem'

/**
 *
 *@author Robert Long
 */
const ProjectGridItemContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  color: ${(props) => props.theme.text};
  height: 200px;
  border-radius: 6px;
  text-decoration: none;
  background-color: ${(props) => props.theme.toolbar};
  justify-content: center;
  align-items: center;
  border: 1px solid transparent;

  &:hover {
    color: white;
    cursor: pointer;
    border-color: white;
  }

  svg {
    width: 3em;
    height: 3em;
    margin-bottom: 20px;
  }
`

/**
 *
 * @author Robert Long
 * @param {string} path
 * @param {string} label
 * @returns
 */
export function NewProjectGridItem({ onClickNew, label }: { onClickNew: any; label: string }) {
  return (
    <ProjectGridItemContainer as="button" onClick={onClickNew}>
      <AddIcon />
      <h3>{label}</h3>
    </ProjectGridItemContainer>
  )
}

/**
 *
 * @author Robert Long
 * @returns
 */
export function LoadingProjectGridItem() {
  const { t } = useTranslation()

  return (
    <ProjectGridItemContainer>
      <h3>{t('editor:projects.grid.loading')}</h3>
    </ProjectGridItemContainer>
  )
}

NewProjectGridItem.defaultProps = {
  label: 'New Project'
}

/**
 *
 * @author Robert Long
 */
const StyledProjectGrid = (styled as any).div`
  display: grid;
  grid-gap: 10px;
  width: 100%;
  margin-bottom: auto;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`

interface ProjectGridProp {
  projects?: any
  projectName?: any
  onClickExisting?: any
  onClickNew?: any
  newProjectLabel?: any
  contextMenuId?: any
  loading?: boolean
  onSelectProject?: Function
}

/**
 *
 * @author Robert Long
 * @param {any} projects
 * @param {any} newProjectPath
 * @param {any} newProjectLabel
 * @param {any} contextMenuId
 * @param {any} loading
 * @returns
 */
export function ProjectGrid({
  projects,
  projectName,
  onClickExisting,
  onClickNew,
  newProjectLabel,
  contextMenuId,
  loading
}: ProjectGridProp) {
  return (
    <StyledProjectGrid style={{ cursor: loading ? 'not-allowed' : 'pointer' }} disable={loading}>
      {onClickNew && !loading && <NewProjectGridItem onClickNew={onClickNew} label={newProjectLabel} />}
      {projects.map((project) => (
        <ProjectGridItem
          onClickExisting={onClickExisting}
          key={project.project_id || project.id || project.name}
          project={project}
          projectName={projectName}
          contextMenuId={contextMenuId}
        />
      ))}
      {loading && <LoadingProjectGridItem />}
    </StyledProjectGrid>
  )
}

/**
 *
 * @author Robert Long
 */
export const ProjectGridContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: ${(props) => props.theme.panel2};
  border-radius: 3px;
`

/**
 *
 * @author Robert Long
 */
export const ProjectGridContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
`

/**
 *
 * @author Robert Long
 */
export const Filter = styled.a<{ active?: boolean }>`
  font-size: 1.25em;
  cursor: pointer;
  color: ${(props) => (props.active ? props.theme.blue : props.theme.text)};
`

/**
 *
 * @author Robert Long
 */
export const Separator = styled.div`
  height: 48px;
  width: 1px;
  background-color: ${(props) => props.theme.border};
`

/**
 *
 * @author Robert Long
 */
export const SearchInput = styled<any>(StringInput)`
  width: auto;
  min-width: 200px;
  height: 28px;
`

/**
 *
 * @author Robert Long
 */
export const CenteredMessage = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`

/**
 *
 * @author Robert Long
 */
export const ErrorMessage = styled(CenteredMessage)`
  color: ${(props) => props.theme.red};
`
