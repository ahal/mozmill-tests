/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozmill Test Code.
 *
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Aakash Desai <adesai@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// Include necessary modules
var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['PrefsAPI'];

const gDelay = 0;
const gTimeout = 5000;

var setupModule = function(module)
{
  controller = mozmill.getBrowserController();

  module.cm = Cc["@mozilla.org/cookiemanager;1"]
                 .getService(Ci.nsICookieManager2);
  cm.removeAll();
}

/**
 * Test removing all cookies via the cookie manager
 */
var testRemoveAllCookies = function()
{
  // Go to mozilla.org to build a list of cookies
  controller.open("http://www.mozilla.org/");
  controller.waitForPageLoad();

  controller.open("http://www.amazon.com/");
  controller.waitForPageLoad();

  // Call preferences dialog and delete the created cookies
  PrefsAPI.openPreferencesDialog(prefDialogCallback);
}

/**
 * Go to the privacy pane and delete all cookies from the cookie manager
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var prefDialogCallback = function(controller)
{
  var prefDialog = new PrefsAPI.preferencesDialog(controller);
  prefDialog.paneId = 'panePrivacy';

  // Go to custom history settings and click on the show cookies button
  var historyMode = new elementslib.ID(controller.window.document, "historyMode");
  controller.waitForElement(historyMode, gTimeout);
  controller.select(historyMode, null, null, "custom");
  controller.sleep(gDelay);

  controller.waitThenClick(new elementslib.ID(controller.window.document, "showCookiesButton"), gTimeout);
  controller.sleep(500);

  try {
    // Grab the cookies manager window
    var window = mozmill.wm.getMostRecentWindow('Browser:Cookies');
    var cmController = new mozmill.controller.MozMillController(window);

    // Get the amount of current cookies
    var cookiesList = cmController.window.document.getElementById("cookiesList");
    cmController.assertJS("subject.cookieCount > 0",
                          {cookieCount : cookiesList.view.rowCount});

    // Verify all cookies have been removed
    cmController.waitThenClick(new elementslib.ID(cmController.window.document, "removeAllCookies"), gTimeout);
    cmController.assertJS("subject.cookieCount == 0",
                          {cookieCount : cookiesList.view.rowCount});
  } catch (ex) {
    throw ex;
  } finally {
    // Close the cookies manager
    cmController.keypress(null, "w", {accelKey: true});
    controller.sleep(200);
  }

  prefDialog.close(true);
}

/**
 * Map test functions to litmus tests
 */
// testRemoveAllCookies.meta = {litmusids : [8054]};
