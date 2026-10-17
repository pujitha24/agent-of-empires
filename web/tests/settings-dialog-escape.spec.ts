// Escape in a dialog inside Settings closes only that dialog; with none open it
// still leaves Settings. Needs real key-event ordering: the global Escape
// shortcut runs in the capture phase before any dialog handler.

import { test, expect } from "./helpers/mockedTest";
import { mockSettingsApis } from "./helpers/apiMocks";

const PLUGIN = {
  id: "acme.kit",
  name: "Acme Kit",
  version: "1.0.0",
  description: "",
  icon: null,
  icon_asset_url: null,
  enabled: true,
  builtin: false,
  validation: "community",
  source: "github.com/acme/kit",
  capabilities: [],
  ui_contributions: [],
  granted: true,
  needs_reapproval: false,
};

test("Escape closes the uninstall dialog but stays in Settings, then leaves Settings", async ({ page }) => {
  await mockSettingsApis(page);
  await page.route(
    (url) => url.pathname === "/api/plugins",
    (route) => route.fulfill({ json: { plugins: [PLUGIN], load_errors: [] } }),
  );
  await page.goto("/settings/plugins");

  await page.getByTestId("plugin-uninstall-acme.kit").click();
  const dialog = page.getByTestId("plugin-uninstall-confirm");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/settings\/plugins$/);

  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/\/settings/);
});
