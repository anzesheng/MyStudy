/**
 * spa.shell.js
 * Shell module for SPA
 */

/*jslint     browser:true, continue:true,
devel:true,  indent:2,     maxerr:50,
newcap:true, nomen:true,   plusplus:true,
regexp:true, sloppy:true,  vars:false,
white:true
*/
/*global $, spa */

spa.shell = (function () {
    // Begin module scope variables
    var
        configMap = {
            anchor_schema_map: {
                chat: { open: true, closed: true }
            },
            main_html: String()
            + '<div class="spa-shell-head">'
            + '    <div class="spa-shell-head-logo"></div>'
            + '    <div class="spa-shell-head-acct"></div>'
            + '    <div class="spa-shell-head-search"></div>'
            + '</div>'
            + '<div class="spa-shell-main">'
            + '    <div class="spa-shell-main-nav"></div>'
            + '    <div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-chat"></div>'
            + '<div class="spa-shell-modal"></div>',
            chat_extend_time: 250,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extended_title: 'Click to retract',
            chat_retracted_title: 'Click to extend',
        },
        stateMap = {
            // the spa div (root div)
            $container: null,
            anchor_map: {},
            is_chart_retracted: true
        },

        // DOM elements cache
        jqueryMap = {},

        // all functions
        copyAnchorMap,
        setJqueryMap,
        toggleChat,
        changeAnchorPart,
        onHashchange,
        onClickChat,
        iniModule;
    // End module scope variables

    // Begin utility methods
    copyAnchorMap = function () {
        return $.extend(true, {}, stateMap.anchor_map);
    };
    // End utility methods

    // Begin DOM methods

    changeAnchorPart = function (arg_map) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;

        // Begin merge chagnes into anchor map
        KEYVAL:
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                if (key_name.indexOf('_') === 0) { continue KEYVAL; }
                anchor_map_revise[key_name] = arg_map[key_name];

                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }

        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        } catch (error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }

        return bool_return;
    };

    setJqueryMap = function () {
        jqueryMap = {
            // the spa div (root div)
            $container: stateMap.$container,
            // the chat div in spa div
            $chat: stateMap.$container.find('.spa-shell-chat')
        };
    };

    toggleChat = function (do_extend, callback) {
        var
            px_chat_ht = jqueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = !is_open && !is_closed;

        if (is_sliding) { return false; }

        if (do_extend) {
            jqueryMap.$chat.animate(
                { height: configMap.chat_extend_height },
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_extended_title);
                    stateMap.is_chart_retracted = false;
                    if (callback) { callback(jqueryMap.$chat); }
                }
            );

            return true;
        }

        jqueryMap.$chat.animate(
            { height: configMap.chat_retract_height },
            configMap.chat_retract_time,
            function () {
                jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
                stateMap.is_chart_retracted = true;
                if (callback) { callback(jqueryMap.$chat); }
            }
        );

        return true;
    };
    // End DOM methods

    // Begin event handlers

    onHashchange = function (event) {
        var
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed, s_chat_proposed;

        // attempt to parse anchor
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;

        // convenient vars
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        // Begin adjust chat component if changed
        if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed) {
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default:
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, ture);
            }
        }

        return false;
    };

    onClickChat = function (event) {
        // toggleChat(stateMap.is_chart_retracted);

        // if (toggleChat(stateMap.is_chart_retracted)) {
        //     $.uriAnchor.setAnchor({
        //         chat: (stateMap.is_chart_retracted ? 'open' : 'closed')
        //     });
        // }

        changeAnchorPart({
            chat: (stateMap.is_chart_retracted ? 'open' : 'closed')
        });

        return false;
    };
    // End event handlers

    // Begin public methods
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        // test toggle
        // setTimeout(function () { toggleChat(true); }, 3000);
        // setTimeout(function () { toggleChat(false); }, 8000);

        // initialize chat slider and bind click handlers
        stateMap.is_chart_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_retracted_title)
            .click(onClickChat);

        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        $(window)
            .bind('hashchange', onHashchange)
            .trigger('hashChange');
    };
    // End public methods

    return { initModule: initModule };
}());
