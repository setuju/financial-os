/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/core/pagination/states/page-state.ts│
 * │  Purpose   : Backend: page-state                                    │
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

export type PageNumberState<TPage> = {
  readonly page: number | null | undefined;
  readonly next: (page: TPage, headers: Headers, itemCount: number) => PageNumberState<TPage> | null;
};

export type PageStateConfig<TPage> = {
  readonly page: number | null | undefined;
  readonly limit: number | null | undefined;
  readonly hasMore?: (page: TPage, headers: Headers) => boolean | null | undefined;
  readonly totalPages?: (page: TPage, headers: Headers) => number | null | undefined;
};

export function pageState<TPage>(config: PageStateConfig<TPage>): PageNumberState<TPage> {
  return {
    page: config.page,
    next(response, headers, itemCount) {
      const current = config.page ?? 1;
      const totalPages = config.totalPages?.(response, headers);
      if (totalPages != null && current >= totalPages) return null;
      const hasMore = config.hasMore?.(response, headers);
      if (hasMore != null) return hasMore ? pageState({ ...config, page: current + 1 }) : null;
      if (itemCount === 0) return null;
      if (totalPages == null && config.limit != null && itemCount < config.limit) return null;
      return pageState({ ...config, page: current + 1 });
    },
  };
}
