# NoteSpace REST API Reference

Base URL: `/api/v1`

All responses follow a consistent envelope structure:
```json
{
  "success": true,
  "data": { ... }
}
```
Or in case of errors:
```json
{
  "success": false,
  "error": "Error message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": [ ... ]
}
```

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account | No |
| `POST` | `/auth/login` | Authenticate with email & password | No |
| `POST` | `/auth/refresh` | Rotate refresh token cookie & get new access token | Cookie |
| `POST` | `/auth/logout` | Invalidate refresh session and clear cookie | Yes |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/auth/change-password` | Update account password | Yes |

---

## 2. Notes (`/notes`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/notes` | List notes with pagination, search, category, tag, sort filters | Yes |
| `POST` | `/notes` | Create a new note | Yes |
| `GET` | `/notes/:id` | Retrieve single note by ID | Yes |
| `PATCH` | `/notes/:id` | Update note title, content, category, tags, or colors | Yes |
| `DELETE` | `/notes/:id` | Soft-delete note (move to trash) | Yes |
| `PATCH` | `/notes/:id/pin` | Toggle pinned status (`{ isPinned: boolean }`) | Yes |
| `PATCH` | `/notes/:id/favorite` | Toggle favorite status (`{ isFavorite: boolean }`) | Yes |
| `PATCH` | `/notes/:id/archive` | Toggle archived status (`{ isArchived: boolean }`) | Yes |

---

## 3. Trash & Recovery (`/trash`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/trash` | List all soft-deleted notes | Yes |
| `POST` | `/trash/:id/restore` | Restore note back to active list | Yes |
| `DELETE` | `/trash/:id` | Permanently delete single note | Yes |
| `DELETE` | `/trash` | Empty trash (permanently remove all trashed notes) | Yes |

---

## 4. Categories (`/categories`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/categories` | List user categories with note counts | Yes |
| `POST` | `/categories` | Create category (`{ name, color }`) | Yes |
| `PATCH` | `/categories/:id` | Update category name and color | Yes |
| `DELETE` | `/categories/:id` | Delete category (unlinks from notes) | Yes |

---

## 5. Tags (`/tags`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/tags` | List all tags owned by user | Yes |
| `POST` | `/tags` | Create a new tag (`{ name, color }`) | Yes |
| `PATCH` | `/tags/:id` | Update tag name/color | Yes |
| `DELETE` | `/tags/:id` | Delete tag (removes tag reference from notes) | Yes |

---

## 6. Search & Dashboard (`/search`, `/dashboard`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/search?q=query` | Full-text relevance search on notes | Yes |
| `GET` | `/dashboard/summary` | Real-time counts (active, archived, trashed, pinned) | Yes |
| `GET` | `/dashboard/activity?days=7`| Daily activity chart counts over 7 or 30 days | Yes |

---

## 7. User Profile (`/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `PATCH` | `/users/me` | Update name and preferences | Yes |
| `DELETE` | `/users/me` | Permanently delete account and all cascading data | Yes |
