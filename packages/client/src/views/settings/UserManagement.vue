<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import {
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type PaginationProps
} from 'naive-ui'
import { useAdminStore, type AdminUser } from '@/stores/admin'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const message = useMessage()
const adminStore = useAdminStore()
const userStore = useUserStore()

const title = computed(() => route.meta.title as string || 'User Management')
const loading = computed(() => adminStore.loading)
const users = computed(() => adminStore.users)
const pagination = ref<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// Columns for the data table
const columns: DataTableColumns<AdminUser> = [
  {
    title: 'Email',
    key: 'email',
    minWidth: 200
  },
  {
    title: 'Display Name',
    key: 'displayName',
    minWidth: 150,
    render: (row) => row.displayName || '-'
  },
  {
    title: 'Role',
    key: 'isAdmin',
    width: 120,
    render: (row) => {
      return h(
        NTag,
        {
          type: row.isAdmin ? 'success' : 'default',
          size: 'small'
        },
        {
          default: () => row.isAdmin ? 'Admin' : 'User'
        }
      )
    }
  },
  {
    title: 'Status',
    key: 'isBanned',
    width: 120,
    render: (row) => {
      return h(
        NTag,
        {
          type: row.isBanned ? 'error' : 'success',
          size: 'small'
        },
        {
          default: () => row.isBanned ? 'Banned' : 'Active'
        }
      )
    }
  },
  {
    title: 'Created At',
    key: 'createdAt',
    minWidth: 180,
    render: (row) => new Date(row.createdAt).toLocaleString()
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 200,
    render: (row) => {
      const actions = []

      // Toggle Ban (only if not self)
      if (row.id !== userStore.userId) {
        actions.push(
          h(
            NButton,
            {
              type: row.isBanned ? 'success' : 'error',
              size: 'small',
              quaternary: true,
              onClick: () => handleToggleBan(row)
            },
            {
              default: () => row.isBanned ? 'Unban' : 'Ban'
            }
          )
        )

        // Delete (only if not self)
        actions.push(
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row),
              negativeText: 'Cancel',
              positiveText: 'Confirm',
              placement: 'top-end'
            },
            {
              default: () => 'Are you sure you want to delete this user?',
              trigger: () => h(
                NButton,
                {
                  type: 'error',
                  size: 'small',
                  quaternary: true
                },
                {
                  default: () => 'Delete'
                }
              )
            }
          )
        )
      }

      return h(NSpace, { size: 'small' }, { default: () => actions })
    }
  }
]

// Load users
async function loadUsers() {
  const result = await adminStore.fetchUsers({
    page: pagination.value.page || 1,
    pageSize: pagination.value.pageSize || 10
  })

  if (!result.success) {
    message.error('Failed to load users')
  } else {
    pagination.value.itemCount = adminStore.pagination.total
    pagination.value.pageCount = Math.ceil(adminStore.pagination.total / (pagination.value.pageSize || 10))
  }
}

// Toggle ban status
async function handleToggleBan(user: AdminUser) {
  if (user.id === userStore.userId) {
    message.error('You cannot ban yourself')
    return
  }

  const result = await adminStore.toggleBan(user.id, !user.isBanned)

  if (result.success) {
    message.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully`)
  } else {
    message.error(result.error || 'Failed to update ban status')
  }
}

// Delete user
async function handleDelete(user: AdminUser) {
  if (user.id === userStore.userId) {
    message.error('You cannot delete yourself')
    return
  }

  const result = await adminStore.deleteUser(user.id)

  if (result.success) {
    message.success('User deleted successfully')
  } else {
    message.error(result.error || 'Failed to delete user')
  }
}

// Handle page change
function handlePageChange(page: number) {
  pagination.value.page = page
  loadUsers()
}

// Handle page size change
function handlePageSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="settings-content">
    <div class="settings-header">
      <h2>{{ title }}</h2>
    </div>

    <n-card>
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        striped
        :remote="true"
      />
    </n-card>
  </div>
</template>

<style scoped lang="scss">
.settings-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .settings-header {
    margin-bottom: 24px;
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
}
</style>
