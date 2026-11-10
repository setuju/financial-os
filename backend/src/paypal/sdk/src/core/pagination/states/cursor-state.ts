/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/core/pagination/states/cursor-state.ts│
 * │  Purpose   : Backend: cursor-state                                  │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

export type CursorState<TPage> = {
  readonly cursor: string | null | undefined;
  readonly next: (page: TPage, headers: Headers) => CursorState<TPage> | null;
};

export type CursorStateConfig<TPage> = {
  readonly cursor: string | null | undefined;
  readonly nextCursor: (page: TPage, headers: Headers) => string | null | undefined;
  readonly hasMore?: (page: TPage, headers: Headers) => boolean | null | undefined;
};

export function cursorState<TPage>(config: CursorStateConfig<TPage>): CursorState<TPage> {
  const cursor = config.cursor;
  return {
    cursor,
    next(response, headers) {
      const nextCursor = config.nextCursor(response, headers);
      if (!nextCursor) return null;
      if (nextCursor === cursor) return null;
      if (config.hasMore?.(response, headers) === false) return null;
      return cursorState({ ...config, cursor: nextCursor });
    },
  };
}
