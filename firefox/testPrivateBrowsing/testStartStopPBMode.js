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
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

/**
 *  Litmus test #7394: Enable Private Browsing Mode
 *  Litmus test #7395: Stop Private Browsing Mode
 *  Litmus test #7443: Verify Ctrl/Cmd+Shift+P keyboard shortcut for Private Browsing mode
 */

var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['PrivateBrowsingAPI', 'UtilsAPI'];

const gDelay = 0;
const gTimeout = 5000;

const websites = [
                  {url: 'http://www.mozilla.org', id: 'q'},
                  {url: 'about:', id: 'aboutPageList'}
                 ];

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
  module.modifier = controller.window.document.documentElement
                              .getAttribute("titlemodifier_privatebrowsing");

  // Create Private Browsing instance and set handler
  module.pb = new PrivateBrowsingAPI.privateBrowsing(controller);
  module.pb.handler = pbStartHandler;
}

var teardownModule = function(module) {
  pb.showPrompt = true;
  pb.enabled = false;
}

/**
 * Enable Private Browsing Mode
 */
var testEnablePrivateBrowsingMode = function()
{
  // Make sure we are not in PB mode and show a prompt
  pb.enabled = false;
  pb.showPrompt = true;

  // Open websites in separate tabs after closing existing tabs
  var newTab = new elementslib.Elem(controller.menus['file-menu'].menu_newNavigatorTab);
  UtilsAPI.closeAllTabs(controller);
  for (var ii = 0; ii < websites.length; ii++) {
    controller.open(websites[ii].url);
    controller.click(newTab);
  }

  // Wait until all tabs have been finished loading
  for (var ii = 0; ii < websites.length; ii++) {
    var elem = new elementslib.ID(controller.tabs.getTab(ii), websites[ii].id);
    controller.waitForElement(elem, gTimeout);
  }

  // Start the Private Browsing mode
  pb.start();

  // Check that only one tab is open
  controller.assertJS(controller.tabs.length == 1);

  // Title modifier should have been set
  controller.assertJS(controller.window.document.title.indexOf(modifier) != -1);

  // Check descriptions on the about:privatebrowsing page
  // XXX: Bug 504635 needs to be implemented so we can get the entities from the DTD
  var longDescElem = new elementslib.ID(controller.tabs.activeTab, "errorLongDescText")
  var moreInfoElem = new elementslib.ID(controller.tabs.activeTab, "moreInfoLink");

  controller.assertNode(longDescElem);
  controller.assertNode(moreInfoElem);
}

/**
 * Stop the Private Browsing mode
 */
var testStopPrivateBrowsingMode = function()
{
  // Force enable Private Browsing mode
  pb.enabled = true;

  // Stop Private Browsing mode
  pb.stop();

  // All tabs should be restored
  controller.assertJS(controller.tabs.length == websites.length + 1);

  for (var ii = 0; ii < websites.length; ii++) {
    var elem = new elementslib.ID(controller.tabs.getTab(ii), websites[ii].id);
    controller.waitForElement(elem, gTimeout);
  }

  // No title modifier should have been set
  controller.assertJS(controller.window.document.title.indexOf(modifier) == -1);
}

/**
 * Verify Ctrl/Cmd+Shift+P keyboard shortcut for Private Browsing mode
 */
var testKeyboardShortcut = function()
{
  // Make sure we are not in PB mode and show a prompt
  pb.enabled = false;
  pb.showPrompt = true;

  // Start the Private Browsing mode via the keyboard shortcut
  pb.start(true);

  // Stop the Private Browsing mode via the keyboard shortcut
  pb.stop(true);
}

/**
 * Handle the modal dialog to enter the Private Browsing mode
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var pbStartHandler = function(controller) {
  // Check to not ask anymore for entering Private Browsing mode
  var checkbox = new elementslib.ID(controller.window.document, 'checkbox');
  controller.waitThenClick(checkbox, gTimeout);

  controller.click(new elementslib.Lookup(controller.window.document, '/id("commonDialog")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}'));
}
