/* * ***** BEGIN LICENSE BLOCK *****
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
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <hskupin@gmail.com>
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
 * **** END LICENSE BLOCK ***** */

var mozmill = {}; Components.utils.import('resource://mozmill/modules/mozmill.js', mozmill);
var elementslib = {}; Components.utils.import('resource://mozmill/modules/elementslib.js', elementslib);

// Include necessary modules
var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['UtilsAPI'];

const gDelay = 0;

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
  module.utils = collector.getModule('UtilsAPI');
}

/**
 *  Testcase ID #6375 - Access "View Page Info" from Context Menu
 */
var testAccessPageInfo = function () {
  // List of all available panes inside the page info window
  var panes = [
               {button: 'generalTab', panel: 'generalPanel'},
               {button: 'mediaTab', panel: 'mediaPanel'},
               {button: 'feedTab', panel: 'feedListbox'},
               {button: 'permTab', panel: 'permPanel'},
               {button: 'securityTab', panel: 'securityPanel'}
              ];

  // Load web page with RSS feed
  controller.open('http://www.cnn.com');
  controller.waitForPageLoad(controller.tabs.activeTab);

  // Open context menu on the html element and select Page Info entry
  controller.rightclick(new elementslib.XPath(controller.tabs.activeTab, "/html"));
  controller.sleep(gDelay);
  controller.click(new elementslib.ID(controller.window.document, "context-viewinfo"));
  controller.sleep(gDelay);

  // Check if the Page Info window has been opened and is in the foreground
  var window = mozmill.wm.getMostRecentWindow('');
  if (window &&
      window.document.documentElement.getAttribute('windowtype') != 'Browser:page-info') {
    window.close();
    throw "Page info window not in foreground";
  }

  // Create controller for checking all tabs
  var piController = new mozmill.controller.MozMillController(window);

  // Step through each of the tabs
  for each (pane in panes) {
    piController.click(new elementslib.ID(piController.window.document, pane.button));
    piController.sleep(gDelay);

    // Check if the panel has been shown
    var node = new elementslib.ID(piController.window.document, pane.panel);
    utils.delayedAssertNode(piController, node);
  }

  // Close the Page Info window by pressing ESC
  var deck = new elementslib.ID(piController.window.document, "mainDeck");
  piController.keypress(deck, 27, false, false, false, false);
}