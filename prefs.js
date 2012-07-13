// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
/*
const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;
const N_ = function(e) { return e };*/

const _ = function(t){return t;};

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;


const WorkspaceSettingsWidget = new GObject.Class({
    Name: 'WorkspaceIndicator.WorkspaceSettingsWidget',
    GTypeName: 'WorkspaceSettingsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
    this.parent(params);
    this.settings = Convenience.getSettings('org.gnome.shell.extensions.dash-to-dock');

    let notebook = new Gtk.Notebook();

    /* MAIN DOCK SETTINGS */

    let dockSettings = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL});
    let dockSettingsTitle = new Gtk.Label({label: "Dock Settings"});


    let dockSettingsMain1 = new Gtk.Box({spacing:30,orientation:Gtk.Orientation.HORIZONTAL, homogeneous:true,
                                         margin_left:20, margin_top:10, margin_bottom:10, margin_right:10});

    let dockSettingsControl1 = new Gtk.Box({spacing:30, margin_left:10, margin_top:10, margin_right:10});

    let alwaysVisibleLabel = new Gtk.Label({label: "Dock is fixed and always visible", use_markup: true,
                                            xalign: 0, hexpand:true});

    let alwaysVisible =  new Gtk.Switch({halign:Gtk.Align.END});
        alwaysVisible.set_active(this.settings.get_boolean('dock-fixed'));
        alwaysVisible.connect("notify::active", Lang.bind(this, function(check){
            this.settings.set_boolean('dock-fixed', check.get_active());
        }));

    dockSettingsControl1.add(alwaysVisibleLabel);
    dockSettingsControl1.add(alwaysVisible);

    /* TIMINGS SETTINGS */

    let dockSettingsGrid1= new Gtk.Grid({row_homogeneous:true,column_homogeneous:false});

    let animationTimeLabel = new Gtk.Label({label: "Animation time [ms]", use_markup: true, xalign: 0,hexpand:true});
    let animationTime = new Gtk.SpinButton({halign:Gtk.Align.END});
            animationTime.set_sensitive(true);
            animationTime.set_range(0, 5000);
            animationTime.set_value(this.settings.get_double("animation-time")*1000);
            animationTime.set_increments(50, 100);
            animationTime.connect("value-changed", Lang.bind(this, function(button){
                let s = button.get_value_as_int()/1000;
                this.settings.set_double("animation-time", s);
            }));

    let showDelayLabel = new Gtk.Label({label: "Show delay [ms]", use_markup: true, xalign: 0, hexpand:true});
    let showDelay = new Gtk.SpinButton({halign:Gtk.Align.END});
            showDelay.set_sensitive(true);
            showDelay.set_range(0, 5000);
            showDelay.set_value(this.settings.get_double("show-delay")*1000);
            showDelay.set_increments(50, 100);
            showDelay.connect("value-changed", Lang.bind(this, function(button){
                let s = button.get_value_as_int()/1000;
                this.settings.set_double("show-delay", s);
            }));

    let hideDelayLabel = new Gtk.Label({label: "Hide delay [ms]", use_markup: true, xalign: 0, hexpand:true});
    let hideDelay = new Gtk.SpinButton({halign:Gtk.Align.END});
            hideDelay.set_sensitive(true);
            hideDelay.set_range(0, 5000);
            hideDelay.set_value(this.settings.get_double("hide-delay")*1000);
            hideDelay.set_increments(50, 100); 
            hideDelay.connect("value-changed", Lang.bind(this, function(button){
                let s = button.get_value_as_int()/1000;
                this.settings.set_double("hide-delay", s);
            }));

    /* INTELLIHIDE AUTOHIDE SETTINGS */

    let dockSettingsGrid2= new Gtk.Grid({row_homogeneous:true,column_homogeneous:false});

    let autohideLabel = new Gtk.Label({label: "Autohide", xalign: 0, hexpand:true});
    let autohide =  new Gtk.Switch({halign:Gtk.Align.END});
        autohide.set_active(this.settings.get_boolean('autohide'));
        autohide.connect("notify::active", Lang.bind(this, function(check){
            this.settings.set_boolean('autohide', check.get_active());
        }));

    let intellihideLabel = new Gtk.Label({label: "intellihide",  xalign: 0, hexpand:true});
    let intellihide =  new Gtk.Switch({halign:Gtk.Align.END});
        intellihide.set_active(this.settings.get_boolean('intellihide'));
        intellihide.connect("notify::active", Lang.bind(this, function(check){
            this.settings.set_boolean('intellihide', check.get_active());
        }));

    dockSettingsGrid1.attach(animationTimeLabel, 0,0,1,1);
    dockSettingsGrid1.attach(animationTime, 1,0,1,1);
    dockSettingsGrid1.attach(showDelayLabel, 0,1,1,1);
    dockSettingsGrid1.attach(showDelay, 1,1,1,1);
    dockSettingsGrid1.attach(hideDelayLabel, 0,2,1,1);
    dockSettingsGrid1.attach(hideDelay, 1,2,1,1);

    dockSettingsGrid2.attach(autohideLabel, 0,0,1,1);
    dockSettingsGrid2.attach(autohide, 1,0,1,1);
    dockSettingsGrid2.attach(intellihideLabel, 0,1,1,1);
    dockSettingsGrid2.attach(intellihide, 1,1,1,1);
    dockSettingsGrid2.attach(new Gtk.Label(), 0,2,1,1);

    dockSettingsMain1.add(dockSettingsGrid1);
    dockSettingsMain1.add(dockSettingsGrid2);

    this.settings.bind('dock-fixed', dockSettingsMain1, 'sensitive', Gio.SettingsBindFlags.INVERT_BOOLEAN);

    /* POISITION AND SIZE */

    let dockMonitor = new Gtk.Box({margin_left:10, margin_top:10, margin_bottom:10, margin_right:10});
        let dockMonitorLabel = new Gtk.Label({label: "Show the dock on following monitor (if attached)", hexpand:true, xalign:0});
        let dockMonitorCombo = new Gtk.ComboBoxText({halign:Gtk.Align.END});
            dockMonitorCombo.append_text('Primary (default)');
            dockMonitorCombo.append_text('1');
            dockMonitorCombo.append_text('2');
            dockMonitorCombo.append_text('3');
            dockMonitorCombo.append_text('4');
            let active = this.settings.get_int('preferred-monitor');
            if (active<0)
                active = 0;
            dockMonitorCombo.set_active(active);

            dockMonitorCombo.connect('changed', Lang.bind (this, function(widget) {
                let active = widget.get_active();
                if (active <=0)
                    this.settings.set_int('preferred-monitor', -1);
                else
                    this.settings.set_int('preferred-monitor', active );
            }));

    dockMonitor.add(dockMonitorLabel)
    dockMonitor.add(dockMonitorCombo);

    let dockSettingsMain2 = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL, homogeneous:false,
                                        margin_left:10, margin_top:10, margin_bottom:10, margin_right:10});


    let verticalCenter =  new Gtk.CheckButton({label: "Center vertically the dock"});
        verticalCenter.set_active(this.settings.get_boolean('vertical-centered'));
        verticalCenter.connect('toggled', Lang.bind(this, function(check){
            this.settings.set_boolean('vertical-centered', check.get_active());
        }));
    let expandHeight =  new Gtk.CheckButton({label: "Use all available vertical space"});
        expandHeight.set_active(this.settings.get_boolean('expand-height'));
        expandHeight.connect('toggled', Lang.bind(this, function(check){
            this.settings.set_boolean('expand-height', check.get_active());
        }));

    this.settings.bind('vertical-centered', expandHeight, 'sensitive', Gio.SettingsBindFlags.DEFAULT);

    dockSettingsMain2.add(verticalCenter);
    dockSettingsMain2.add(expandHeight);

    let allSizes  =[ 16, 24, 32, 48, 64 ];
    let maximumIconSizeBox = new Gtk.Box({spacing:30});

    let maximumIconSizeLabel = new Gtk.Label({label: "Set the maximum icon size", use_markup: true,
                                              xalign: 0, valign: Gtk.Align.END, margin_bottom:5});

    let maximumIconSize =  new Gtk.Scale({orientation: Gtk.Orientation.HORIZONTAL, valuePos: Gtk.PositionType.RIGHT,
                                          valign: Gtk.Align.END, halign: Gtk.Align.FILL, hexpand:true, margin_top:10});
        maximumIconSize.set_range(0, 4); // =[ 16, 24, 32, 48, 64 ]
        maximumIconSize.set_value(allSizes.indexOf(this.settings.get_int('dash-max-icon-size')));
        maximumIconSize.set_digits(0);
        maximumIconSize.set_increments(1,1);
        maximumIconSize.set_size_request(200, -1);

        maximumIconSize.add_mark(0,Gtk.PositionType.TOP,"16");
        maximumIconSize.add_mark(1,Gtk.PositionType.TOP,"24");
        maximumIconSize.add_mark(2,Gtk.PositionType.TOP,"32");
        maximumIconSize.add_mark(3,Gtk.PositionType.TOP,"48");
        maximumIconSize.add_mark(4,Gtk.PositionType.TOP,"64");

        maximumIconSize.connect('format-value', Lang.bind(this, function(button){
            return allSizes[Math.floor(button.get_value())].toString();
            
        }));

        maximumIconSize.connect('value-changed', Lang.bind(this, function(button){
            let s = Math.floor(button.get_value());
            this.settings.set_int('dash-max-icon-size', allSizes[s]);
        }));

    dockSettingsMain2.add(maximumIconSizeBox);

    maximumIconSizeBox.add(maximumIconSizeLabel);
    maximumIconSizeBox.add(maximumIconSize);;
    dockSettings.add(dockSettingsControl1);
    dockSettings.add(dockSettingsMain1);
    //dockSettings.add(dockSettingsControl2);
    dockSettings.add(dockMonitor);
    dockSettings.add(dockSettingsMain2);

    notebook.append_page(dockSettings, dockSettingsTitle);

    /* CUSTOMIZATION PAGE */

    let customization = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL});
    let customizationTitle = new Gtk.Label({label: "Customization"});

    /* OPAQUE LAYER */

    let opaqueLayerControl = new Gtk.Box({margin_left:10, margin_top:10, margin_bottom:10, margin_right:10});


    let opaqueLayerLabel = new Gtk.Label({label: "Add an opaque layer below the dock", xalign: 0, hexpand:true});
    let opaqueLayer = new Gtk.Switch({halign:Gtk.Align.END});
            opaqueLayer.set_active(this.settings.get_boolean('opaque-background'));
            opaqueLayer.connect('notify::active', Lang.bind(this, function(check){
                this.settings.set_boolean('opaque-background', check.get_active());
            }));


    opaqueLayerControl.add(opaqueLayerLabel);
    opaqueLayerControl.add(opaqueLayer);
    customization.add(opaqueLayerControl);

    let opaqueLayerMain = new Gtk.Box({spacing:30, orientation:Gtk.Orientation.HORIZONTAL, homogeneous:false,
                                       margin_left:20, margin_top:10, margin_bottom:10, margin_right:10});

    let layerOpacityLabel = new Gtk.Label({label: "Layer opacity", use_markup: true, xalign: 0});
    let layerOpacity =  new Gtk.Scale({orientation: Gtk.Orientation.HORIZONTAL, valuePos: Gtk.PositionType.RIGHT});
        layerOpacity.set_range(0, 100);
        layerOpacity.set_value(this.settings.get_double('background-opacity')*100);
        layerOpacity.set_digits(0);
        layerOpacity.set_increments(5,5);
        layerOpacity.set_size_request(200, -1);
        layerOpacity.connect('value-changed', Lang.bind(this, function(button){
            let s = button.get_value()/100;
            this.settings.set_double('background-opacity', s);
        }));
     let opaqueLayeralwaysVisible =  new Gtk.CheckButton({label: "always visible", margin_left: 20});
        opaqueLayeralwaysVisible.set_active(this.settings.get_boolean('opaque-background-always'));
        opaqueLayeralwaysVisible.connect('toggled', Lang.bind(this, function(check){
            this.settings.set_boolean('opaque-background-always', check.get_active());
        }));

    this.settings.bind('opaque-background', opaqueLayerMain, 'sensitive', Gio.SettingsBindFlags.DEFAULT);


    opaqueLayerMain.add(layerOpacityLabel);
    opaqueLayerMain.add(layerOpacity);
    opaqueLayerMain.add(opaqueLayeralwaysVisible);

    customization.add(opaqueLayerMain);

    /* SWITCH WORKSPACE */

    let switchWorkspaceControl = new Gtk.Box({margin_left:10, margin_top:10, margin_bottom:5, margin_right:10});

    let switchWorkspaceLabel = new Gtk.Label({label: "Switch workspace when scrolling over the dock",
                                              xalign: 0, hexpand:true});
    let switchWorkspace = new Gtk.Switch({halign:Gtk.Align.END});
            switchWorkspace.set_active(this.settings.get_boolean('scroll-switch-workspace'));
            switchWorkspace.connect('notify::active', Lang.bind(this, function(check){
                this.settings.set_boolean('scroll-switch-workspace', check.get_active());
            }));

    let switchWorkspaceMain = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL, homogeneous:true,
                                       margin_left:20, margin_top:5, margin_bottom:10, margin_right:10});

    let only1px = new Gtk.RadioButton({label: "Only a 1px wide area close to the screen edge is active"});
        only1px.set_active(!this.settings.get_boolean('scroll-switch-workspace-whole'));
        only1px.connect("toggled", Lang.bind(this, function(check){
            if(check.get_active()) this.settings.set_boolean('scroll-switch-workspace-whole', false);
        }));
    let wholeArea = new Gtk.RadioButton({label: "All the area of the dock is active", group: only1px });
        wholeArea.set_active(this.settings.get_boolean('scroll-switch-workspace-whole'));
        wholeArea.connect("toggled", Lang.bind(this, function(check){
            if(check.get_active()) this.settings.set_boolean('scroll-switch-workspace-whole', true);
        }));

    this.settings.bind('scroll-switch-workspace', switchWorkspaceMain, 'sensitive', Gio.SettingsBindFlags.DEFAULT);

    switchWorkspaceMain.add(only1px);
    switchWorkspaceMain.add(wholeArea);

    switchWorkspaceControl.add(switchWorkspaceLabel)
    switchWorkspaceControl.add(switchWorkspace)

    customization.add(switchWorkspaceControl);
    customization.add(switchWorkspaceMain);

    let showIcons = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                 margin_left:10, margin_top:10, margin_bottom:10, margin_right:10})

    let showFavorites =  new Gtk.CheckButton({label: "Show favorite application icons"});
        showFavorites.set_active(this.settings.get_boolean('show-favorites'));
        showFavorites.connect('toggled', Lang.bind(this, function(check){
            this.settings.set_boolean('show-favorites', check.get_active());
        }));
    let showRunning =  new Gtk.CheckButton({label: "Show running application icons"});
        showRunning.set_active(this.settings.get_boolean('show-running'));
        showRunning.connect('toggled', Lang.bind(this, function(check){
            this.settings.set_boolean('show-running', check.get_active());
        }));

    showIcons.add(showFavorites);
    showIcons.add(showRunning);

    customization.add(showIcons);

    notebook.append_page(customization, customizationTitle);


/*
    let OptionalFeaturesTitle = new Gtk.Label({label: "Optional Features"});
    let OptionalFeatures = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL});

    OptionalFeatures.add(switchWorkspaceControl);
    OptionalFeatures.add(switchWorkspaceMain);

    notebook.append_page(OptionalFeatures, OptionalFeaturesTitle);
*/


    this.add(notebook);


    }
});

function init() {
   // Convenience.initTranslations();
}

function buildPrefsWidget() {
    let widget = new WorkspaceSettingsWidget({orientation: Gtk.Orientation.VERTICAL, spacing:5, border_width:5});
    widget.show_all();

    return widget;
}

