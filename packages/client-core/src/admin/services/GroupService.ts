import { createState, useState } from '@speigg/hookstate'

import { Group } from '@xrengine/common/src/interfaces/Group'
import { GroupResult } from '@xrengine/common/src/interfaces/GroupResult'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

/**
 *
 * @param files FIle type
 * @returns URL
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */

//State
export const GROUP_PAGE_LIMIT = 12

export const state = createState({
  group: [] as Array<Group>,
  skip: 0,
  limit: GROUP_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now(),
  fetching: false
})

store.receptors.push((action: GroupActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'GROUP_FETCHING':
        return s.merge({ fetching: true })
      case 'GROUP_ADMIN_RETRIEVED':
        return s.merge({
          group: action.list.data,
          skip: action.list.skip,
          limit: action.list.limit,
          total: action.list.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'ADD_GROUP':
        return s.merge({ updateNeeded: true })
      case 'GROUP_ADMIN_UPDATE':
        return s.merge({ updateNeeded: true })
      case 'GROUP_ADMIN_DELETE':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessGroupState = () => state

export const useGroupState = () => useState(state) as any as typeof state

//Service
export const GroupService = {
  getGroupService: async (
    incDec?: 'increment' | 'decrement',
    search: string | null = null,
    skip = accessGroupState().skip.value
  ) => {
    const dispatch = useDispatch()
    {
      const limit = accessGroupState().limit.value
      try {
        dispatch(GroupAction.fetchingGroup())
        const list = await client.service('group').find({
          query: {
            $skip: skip * GROUP_PAGE_LIMIT,
            $limit: limit,
            search: search
          }
        })
        dispatch(GroupAction.setAdminGroup(list))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  createGroupByAdmin: async (groupItem: any) => {
    const dispatch = useDispatch()
    {
      try {
        const newGroup = await client.service('group').create({ ...groupItem })
        dispatch(GroupAction.addAdminGroup(newGroup))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  patchGroupByAdmin: async (groupId, groupItem) => {
    const dispatch = useDispatch()
    {
      try {
        const group = await client.service('group').patch(groupId, groupItem)
        dispatch(GroupAction.updateGroup(group))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  deleteGroupByAdmin: async (groupId) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('group').remove(groupId)
        dispatch(GroupAction.removeGroupAction(groupId))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

//Action
export const GroupAction = {
  fetchingGroup: () => {
    return {
      type: 'GROUP_FETCHING' as const
    }
  },
  setAdminGroup: (list: GroupResult) => {
    return {
      type: 'GROUP_ADMIN_RETRIEVED' as const,
      list
    }
  },
  addAdminGroup: (item: Group) => {
    return {
      type: 'ADD_GROUP' as const,
      item
    }
  },
  updateGroup: (item: Group) => {
    return {
      type: 'GROUP_ADMIN_UPDATE' as const,
      item
    }
  },
  removeGroupAction: (item: Group) => {
    return {
      type: 'GROUP_ADMIN_DELETE' as const,
      item
    }
  }
}

export type GroupActionType = ReturnType<typeof GroupAction[keyof typeof GroupAction]>
