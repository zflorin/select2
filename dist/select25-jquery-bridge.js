;(function ($, window, document, React, ReactDOM, select2, undefined) {

    "use strict";

    var pluginName = "select25",
        defaults = {
            //propertyName: "value"
        };

    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        if (!this.settings.name) {
            this.settings.name = $(element).attr("name");
        }

        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {

            var container = document.createElement("div");

            var target = $(this.element);
            target.hide();
            target.after(container);

            ReactDOM.render(React.createElement(select25.MultiSelect, this.settings), container);
        },

    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document, React, ReactDOM, select2);