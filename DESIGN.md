# Design Specification: Ticketmaster Mobile Native

This document defines the exact visual and behavioral requirements for the "Internal View" (post-login) of the Ticketmaster platform, as captured in the user-provided screenshots.

## 1. Global Components

### 1.1 Bottom Navigation Bar (Mobile Only)
- **Background**: Solid `#FFFFFF` (White).
- **Border**: Top border `#F4F7F9` (1px).
- **Height**: ~64px.
- **Active State**: Icon and label color `#026CDF` (Ticketmaster Blue).
- **Inactive State**: Icon and label color `#8E8E93` (Gray).
- **Items**:
  - **Discover**: `faSearch` | "Discover"
  - **Favorites**: `faHeart` | "Favorites"
  - **My Tickets**: `faTicketAlt` | "My Tickets"
  - **My Account**: `faUserCircle` | "My Account"

### 1.2 Header (My Events Page)
- **Background**: `#FFFFFF` (White).
- **Layout**: 
  - Left: (Empty or Back arrow if deep link).
  - Center: "My Events" (Font-size: 16px, Weight: Black/900).
  - Right: US Flag (SVG/Image) + "Help" (Blue link).

## 2. Page: My Tickets (Purchases)

### 2.1 Tab System
- **Labels**: "UPCOMING (N)" and "PAST (M)".
- **Style**: Uppercase, letter-spacing: 0.05em.
- **Active Indicator**: Thick `#026CDF` bottom border (4px).

### 2.2 Event Cards
- **Card Wrapper**: Borderless or very subtle border, rounded-none (edge-to-edge) or slight rounding.
- **Hero Image**: Aspect ratio 16:9, full card width.
- **Content Overlay/Bottom**:
  - Date/Time: e.g., "FRI • JUL 17, 2026 • 7:30 PM" (Small, bold).
  - Title: "ENHYPEN WORLD TOUR..." (20px, Bold, Line-height: Tight).
  - Venue: "American Airlines Center..." (12px, Gray).
  - **Badge**: "x3" (Ticket icon + number) in the bottom right corner.

## 3. Page: Ticket Detail (View Tickets)

### 3.1 Hero Section
- Full-bleed image at the top of the viewport.
- Gradient overlay at the bottom for text readability.
- **Back Arrow**: Circular button with dark overlay.
- **Help Button**: Text button with dark overlay.
- **Metadata**: Title and Venue on top of the image.

### 3.2 Action Area
- **Primary Button**: "View Tickets" (Solid `#026CDF`, full width, rounded-lg).
- **Secondary Tabs**: "Tickets" | "Extras" (Underline style).

### 3.3 Ticket Information
- **Order Details**: "Order #..." (Small, bold).
- **Seat Details**: Row/Seat/Section in a white container with subtle borders.
- **Floating Controls**: "Transfer" and "Sell" pill button floating above the content.

## 4. Typography & Colors
- **Primary Font**: Inter or Roboto (Fallback to sans-serif).
- **Colors**:
  - Blue: `#026CDF`
  - Dark Navy: `#001B41`
  - Background: `#F4F7F9` (Light gray-blue)
  - Text Primary: `#1F262D`
  - Text Secondary: `#767676`
