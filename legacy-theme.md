# Legacy Theme Documentation

This document describes the current `legacy` mirror display theme implementation in this repo and defines a production-ready configuration contract for controlling it from Supabase settings.

## 1. Purpose

The legacy theme is the kiosk display mode that renders wall posts as physics-driven "pills" that fall, collide, stack, fade out, and restart in cycles.

Primary goals:
- Always-on black display background.
- High readability of post content and metadata.
- Passive, deterministic animation suitable for unattended mirrors.
- Resilient behavior with offline snapshot fallback.

## 2. Where It Lives

Implementation files:
- `src/phases/DisplayPhase.tsx`
- `src/themes/legacy/LegacyRainStage.tsx`
- `src/themes/legacy/useLegacyPhysicsScene.ts`
- `src/themes/legacy/legacyPhysics.ts`
- `src/themes/legacy/LegacyPillCard.tsx`
- `src/lib/avatar.ts`

Support types/defaults:
- `src/types/mirror.ts`
- `src/types/posts.ts`
- `src/lib/settingsDefaults.ts`
- `src/lib/settingsNormalizer.ts`

## 3. Runtime Flow

### 3.1 Theme Routing

`DisplayPhase` routes to legacy when:
- `config.settings.visual_theme === "legacy"`

Legacy is rendered via `LegacyRainStage`.

### 3.2 Cycle State Machine

Implemented in `useLegacyPhysicsScene`:
- `spawning`
- `settling`
- `fading_out`
- `blackout`
- `resetting`

Default timings:
- Fade out: `800ms`
- Blackout: `300ms`

### 3.3 Physics and Rendering Loop

Engine:
- Matter.js `Engine`, `Runner`, `Bodies`, `Body`, `Composite`

Timing:
- Physics runner delta: `1000 / 60`
- React render-sync throttled to ~20 FPS (`>= 50ms` between mapped state updates)

Scene behavior:
- Static floor and side walls
- Spawn queue from feed posts
- Body stacking with cap (`MAX_LEGACY_PILLS`)
- Settle detection by linear + angular velocity thresholds with debounce
- Reset at cycle boundary and replay current batch

## 4. Current Legacy Constants (Code)

From `src/themes/legacy/legacyPhysics.ts`:

| Constant | Current Value | Purpose |
|---|---:|---|
| `MAX_LEGACY_PILLS` | `30` | Max active pills in physics world |
| `SPAWN_INTERVAL_MS` | `1700` | Base spawn interval |
| `SPAWN_JITTER_MS` | `700` | Random jitter added to spawn interval |
| `FLOOR_THICKNESS` | `70` | Physics floor thickness |
| `WALL_THICKNESS` | `60` | Left/right wall thickness |
| `LEGACY_FADE_OUT_MS` | `800` | Fade duration before reset |
| `LEGACY_BLACKOUT_MS` | `300` | Blackout duration before respawn |
| `LEGACY_SETTLE_SPEED` | `0.07` | Linear settle threshold |
| `LEGACY_SETTLE_ANGULAR_SPEED` | `0.004` | Angular settle threshold |
| `LEGACY_SETTLE_DEBOUNCE_MS` | `900` | Time all bodies must remain settled |
| `LEGACY_GRAVITY_Y` | `0.2` | Vertical gravity |
| `LEGACY_BODY_FRICTION` | `0.9` | Surface friction |
| `LEGACY_BODY_FRICTION_AIR` | `0.014` | Air drag |
| `LEGACY_BODY_RESTITUTION` | `0.075` | Bounce |
| `LEGACY_BODY_DENSITY` | `0.0011` | Body density |
| `LEGACY_TARGET_FILL_RATIO` | `0.9` | Target settled stack height ratio |

## 5. Supabase Mirror Settings Currently Used by Legacy

These are read from `config.settings` and actively affect legacy rendering.

### 5.1 Theme-Level Keys Used

| Settings Path | Type | Used In | Effect |
|---|---|---|---|
| `settings.visual_theme` | `string` | `DisplayPhase` | Enables legacy renderer when `legacy` |
| `settings.font_family` | `string` | App settings loader | Controls loaded font for text rendering |
| `settings.color_palette.background` | `hex color` | `getLegacyPillColors` | Plain pill surface color |
| `settings.color_palette.secondary` | `hex color` | `getLegacyPillColors` | Enhanced pill surface color |
| `settings.color_palette.primary` | `hex color` | `getLegacyPillColors` | Plain pill border color |
| `settings.color_palette.accent` | `hex color` | `getLegacyPillColors` | Enhanced border + glow color |

### 5.2 Content Keys Used

| Settings Path | Type | Used In | Effect |
|---|---|---|---|
| `settings.content.max_posts_visible` | `number` | feed polling path | Post limit requested/kept |
| `settings.content.show_author_name` | `boolean` | `LegacyPillCard`, sizing | Shows/hides author text; affects dimensions |
| `settings.content.show_post_date` | `boolean` | `LegacyPillCard`, sizing | Shows/hides date chip; affects dimensions |
| `settings.content.max_text_lines` | `number` | `LegacyPillCard`, sizing | Max message lines + body size estimation |
| `settings.content.show_location` | `boolean` | scene deps only | Present in deps, but location text is not rendered in legacy card currently |

### 5.3 Poll/Refresh Inputs

| Field | Source | Effect |
|---|---|---|
| `posts_poll_ms` | `/api/status` | Controls posts refresh cadence |
| `refresh_interval_seconds` | mirror config | Influences server polling recommendation chain |

## 6. Mirror Settings Present but Ignored in Legacy Runtime

For legacy, these are normalized/defaulted but not used for visual output/physics behavior today:
- `settings.behavior.*` (transition style, transition duration, idle animation, empty state message behavior except non-legacy fallback views)
- `settings.schedule.*` for legacy rendering path
- `settings.filters.*` for card rendering/physics (server still uses filters for feed query)
- `settings.branding.*` does not alter pill design in legacy
- `settings.tags`

Note:
- Server-side feed generation still applies display mode and SQL-level filters.
- Legacy UI intentionally focuses on `visual_theme`, `font_family`, `color_palette`, and selected `content` keys.

## 7. Post Fields Used by Legacy Cards

From `WallPost` (`src/types/posts.ts`) and card code:

Required/primary:
- `id`
- `message`
- `created_at`
- `is_enhanced`

Author/avatar:
- `author_display_name_snapshot`
- `author_name` (fallback)
- `author_avatar_icon_data_url_snapshot` (priority source)
- `author_avatar_icon_path_snapshot` (fallback source)

Metadata chips:
- `country_code`
- `feeling_emoji`
- `feeling_label`

Ignored by legacy card currently:
- `location_text`
- `author_instagram_snapshot`
- `author_linkedin_snapshot`
- `author_x_snapshot`

## 8. Avatar Pipeline (Current)

### 8.1 Server Enrichment

The server enriches posts with `author_avatar_icon_data_url_snapshot` and stores them into cache and `.snapshot.local.json`.

Behavior:
- Path-based cache avoids repeated avatar fetches.
- Relative paths resolve to `public-avatars` storage URL.
- Fetch failures are non-fatal; avatar data URL is omitted.

### 8.2 Frontend Resolution Priority

`resolveAvatarSnapshotUrl(post)` resolves image source in this order:
1. `author_avatar_icon_data_url_snapshot` (if valid `data:` URL)
2. `author_avatar_icon_path_snapshot` (data/http/https)
3. Relative path via `VITE_SUPABASE_URL/storage/v1/object/public/public-avatars/...`
4. Fallback to initials badge

## 9. Legacy Pill Visual Contract (Current)

- Black stage background always.
- Pill shape: rounded capsule with visible border.
- Left avatar slot.
- Row 1: author (optional), country chip, feeling chip, date chip (optional).
- Row 2: message with line clamp.
- Enhanced posts: stronger glow and enhanced palette mapping.
- Dynamic size computed from content and `uiScale`.

## 10. Proposed Supabase Variables for Legacy Theme (Future)

Recommended: store under `settings.theme_legacy` (object) so legacy-specific controls stay isolated.

### 10.1 Physics Controls

| Key | Type | Suggested Default | Range | Maps To |
|---|---|---:|---|---|
| `theme_legacy.gravity_y` | number | `0.2` | `0.05..0.6` | `LEGACY_GRAVITY_Y` |
| `theme_legacy.body_friction` | number | `0.9` | `0.2..1.2` | `LEGACY_BODY_FRICTION` |
| `theme_legacy.body_friction_air` | number | `0.014` | `0.001..0.05` | `LEGACY_BODY_FRICTION_AIR` |
| `theme_legacy.body_restitution` | number | `0.075` | `0..0.35` | `LEGACY_BODY_RESTITUTION` |
| `theme_legacy.body_density` | number | `0.0011` | `0.0005..0.003` | `LEGACY_BODY_DENSITY` |
| `theme_legacy.settle_speed` | number | `0.07` | `0.01..0.2` | `LEGACY_SETTLE_SPEED` |
| `theme_legacy.settle_angular_speed` | number | `0.004` | `0.001..0.02` | `LEGACY_SETTLE_ANGULAR_SPEED` |
| `theme_legacy.settle_debounce_ms` | number | `900` | `300..3000` | `LEGACY_SETTLE_DEBOUNCE_MS` |

### 10.2 Spawn + Density Controls

| Key | Type | Suggested Default | Range | Maps To |
|---|---|---:|---|---|
| `theme_legacy.max_pills` | number | `30` | `8..40` | `MAX_LEGACY_PILLS` |
| `theme_legacy.spawn_interval_ms` | number | `1700` | `400..6000` | `SPAWN_INTERVAL_MS` |
| `theme_legacy.spawn_jitter_ms` | number | `700` | `0..3000` | `SPAWN_JITTER_MS` |
| `theme_legacy.target_fill_ratio` | number | `0.9` | `0.7..0.98` | `LEGACY_TARGET_FILL_RATIO` |
| `theme_legacy.spawn_margin_px` | number | `48` | `8..160` | spawn X margin currently hardcoded |

### 10.3 Cycle/Transition Controls

| Key | Type | Suggested Default | Range | Maps To |
|---|---|---:|---|---|
| `theme_legacy.fade_out_ms` | number | `800` | `0..3000` | `LEGACY_FADE_OUT_MS` |
| `theme_legacy.blackout_ms` | number | `300` | `0..2000` | `LEGACY_BLACKOUT_MS` |
| `theme_legacy.restart_on_settle` | boolean | `true` | boolean | keep/disable automatic cycle reset |

### 10.4 Visual/Layout Controls

| Key | Type | Suggested Default | Range | Purpose |
|---|---|---:|---|---|
| `theme_legacy.pill_min_width_px` | number | `170` | `120..480` | Clamp for body width |
| `theme_legacy.pill_max_width_ratio` | number | `0.9` | `0.4..1.0` | Max width vs viewport |
| `theme_legacy.pill_min_height_px` | number | `72` | `44..200` | Clamp for body height |
| `theme_legacy.pill_max_height_px` | number | `320` | `120..520` | Clamp for body height |
| `theme_legacy.ui_scale_min` | number | `0.72` | `0.5..1.5` | Lower scale clamp |
| `theme_legacy.ui_scale_max` | number | `2.15` | `1..3` | Upper scale clamp |
| `theme_legacy.avatar_size_min_px` | number | `30` | `20..80` | Avatar lower clamp |
| `theme_legacy.avatar_size_max_px` | number | `56` | `28..120` | Avatar upper clamp |
| `theme_legacy.enhanced_glow_strength` | number | `1.0` | `0..3` | Scale enhanced glow intensity |

### 10.5 Rendering/Performance Controls

| Key | Type | Suggested Default | Range | Purpose |
|---|---|---:|---|---|
| `theme_legacy.physics_fps` | number | `60` | `20..120` | Runner delta target |
| `theme_legacy.render_sync_fps` | number | `20` | `5..60` | React map/update throttle |
| `theme_legacy.resize_debounce_ms` | number | `120` | `0..1000` | Resize observer debounce |

## 11. Recommended Supabase JSON Shape

```json
{
  "schema_version": 1,
  "visual_theme": "legacy",
  "font_family": "plus_jakarta_sans",
  "color_palette": {
    "background": "#F8FAFC",
    "secondary": "#0EA5E9",
    "primary": "#4F46E5",
    "accent": "#F59E0B"
  },
  "content": {
    "max_posts_visible": 15,
    "show_author_name": true,
    "show_post_date": false,
    "show_location": true,
    "max_text_lines": 5,
    "profanity_filter_mode": "moderate"
  },
  "theme_legacy": {
    "gravity_y": 0.2,
    "spawn_interval_ms": 1700,
    "spawn_jitter_ms": 700,
    "target_fill_ratio": 0.9,
    "fade_out_ms": 800,
    "blackout_ms": 300,
    "max_pills": 30,
    "enhanced_glow_strength": 1.0,
    "physics_fps": 60,
    "render_sync_fps": 20
  }
}
```

## 12. Implementation Notes for Production

- Add `theme_legacy` as optional and fully runtime-normalized (same style as `settingsNormalizer`).
- Clamp all numeric values to safe bounds to protect kiosk stability.
- Keep black stage background invariant regardless of palette.
- Treat missing/invalid theme keys as defaults without breaking render.
- Apply new settings at cycle boundaries to avoid remount/reflow storms.

## 13. Quick Operations Checklist

When diagnosing legacy behavior:
1. Confirm `visual_theme` is exactly `legacy`.
2. Confirm `/api/status` has expected `settings` and `posts_poll_ms`.
3. Confirm `/api/posts` returns items with expected metadata.
4. Confirm snapshot contains `author_avatar_icon_data_url_snapshot` when avatars are available.
5. Use debug overlay (`q`, `d`, `s`, `p`) to inspect runtime health and cache counts.

