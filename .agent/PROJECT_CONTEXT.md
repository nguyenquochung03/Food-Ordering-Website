# PROJECT_CONTEXT.md

Purpose
- Food Ordering Website: online ordering platform connecting customers, admin operators, and delivery staff to manage menus, orders, and deliveries.

Primary actors
- User: browses menu, places orders, views order history, updates profile.
- Admin: manages menu items, processes orders, manages delivery staff and site settings.
- Delivery Staff: views assigned deliveries, updates delivery status, confirms completion.

Core business logic (concise)
- Menu/catalog: items have name, description, price, category, images, availability.
- Order creation: user adds items to cart, submits order with address and payment metadata; order transitions through statuses (Created → Confirmed → Preparing → OutForDelivery → Delivered → Cancelled).
- Inventory & availability: optional availability flags and simple stock counters at item level.
- Notifications: email / in-app notifications for key status changes (order accepted, out for delivery, delivered).

Key flows
- Order creation flow:
  - User builds cart → submits order → backend validates stock, calculates totals and fees → create order, set status `Created` → notify admin/kitchen → admin confirms → assign delivery staff → status moves to `OutForDelivery` → delivery updates to `Delivered`.

- Food browsing flow:
  - User requests categories or search → API returns paginated, filtered results with sorting and relevant metadata.

- Delivery handling flow:
  - Admin assigns or auto-assigns delivery staff → delivery staff receives list → updates status and timestamps → customer and admin receive updates.

Non-functional notes
- Expect typical small-to-medium scale traffic; optimize read paths and paginate lists.
- Use JWT-based auth for API; protect admin and delivery endpoints with role checks.
