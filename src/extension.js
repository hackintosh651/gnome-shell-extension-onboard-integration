// Origonal: https://github.com/schuhumi/gnome-shell-extension-onboard-integration
// Forked by PeterPorker3 
// https://github.com/PeterPorker3/gnome-shell-extension-onboard-integration/
// forked by hackintosh651

const St = imports.gi.St;
const Main = imports.ui.main;
const Keyboard = imports.ui.keyboard.Keyboard;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

// This the D-Bus interface as XML
const OnboardInterface = '<node> \
  <interface name="org.onboard.Onboard.Keyboard"> \
    <method name="ToggleVisible"> \
    </method> \
    <method name="Show"> \
    </method> \
    <method name="Hide"> \
    </method> \
  </interface> \
</node>';

// Declare the proxy class based on the interface
const OnboardProxy = Gio.DBusProxy.makeProxyWrapper(OnboardInterface);

// Get the /org/onboard/Onboard/Keyboard instance from the bus
let OnbProxy = new OnboardProxy(
    Gio.DBus.session,
    "org.onboard.Onboard",
    "/org/onboard/Onboard/Keyboard"
);


let showBackup
let hideBackup

function init() {
    
}

function enable() {
    showBackup = Keyboard.prototype['_open']
    Keyboard.prototype['_open'] = function(monitor) {
        if (!this._keyboardRequested)
            return;

        Main.layoutManager.keyboardIndex = monitor;
        log("ACTION MODE: " + Main.actionMode);
        if( Main.actionMode == 1 || Main.actionMode == 2) //1=Shell.ActionMode.NORMAL) // No activity overview etc.
            { // hide caribou, show onboard
                log("THE DOGE SAYS ONBOARD SHOULD BE SHOWN");
                //this._hideSubkeys();
                Main.layoutManager.hideKeyboard();

                OnbProxy.ShowSync();   
                this._keyboardVisible = true;
            }
        else
            { // hide onboard, show caribou
                OnbProxy.HideSync();

                //this._redraw();
                Main.layoutManager.showKeyboard();
            }
        //this._destroySource();
    }

    hideBackup = Keyboard.prototype['_close']
    Keyboard.prototype['_close'] = function() {
        OnbProxy.HideSync();
        if (this._keyboardRequested)
            return;

        //this._hideSubkeys();
        Main.layoutManager.hideKeyboard();
        //this._createSource();
    }

    GLib.spawn_command_line_async( "onboard" ); // Start onboard
}

function disable() {
    Keyboard.prototype['_open'] = showBackup
    Keyboard.prototype['_close'] = hideBackup
}
