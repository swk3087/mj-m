/*
 * Developer Utility Blocks for EntryJS
 *
 * This script registers a new category named "developer" in EntryJS and
 * exposes a handful of helper blocks aimed at making it easier for power
 * users to fetch data, manipulate JSON/arrays/objects and evaluate
 * JavaScript at runtime.  The implementation patterns follow the
 * official EntryJS documentation on block creation【769467075486655†L94-L116】
 * and take inspiration from the public “Specialblock” example
 * implementation【422189139003298†L328-L345】.  Blocks that return a value
 * use the `basic_string_field` skeleton while blocks that perform an
 * action without returning a value use the `basic` skeleton.  As with
 * all custom blocks, use them responsibly – executing arbitrary
 * JavaScript via `eval` or `fetch` can have side effects.
 */

(() => {
    // ---------------------------------------------------------------------
    // Category registration
    // ---------------------------------------------------------------------
    // Extend the static block list with our custom category.  Each
    // category entry contains the category name and an ordered array of
    // block names to expose on the palette.  After appending our entry
    // we override EntryStatic.getAllBlocks so that the runtime includes
    // the additional blocks.  This pattern is taken from the official
    // example code【422189139003298†L280-L285】.
    const DEV_CATEGORY = 'developer';
    const DEV_BLOCKS = [
        // Utility blocks defined in the first version of this script
        'http_get',
        'json_parse',
        'json_stringify',
        'eval_code',
        'get_property',
        'set_property',
        'array_get',
        'array_length',
        'object_keys',
        'console_log',
        // Entry API blocks appended in the second version
        'show_toast',
        'get_uptime',
        'is_default_project',
        'is_mobile',
        'export_project',
        'clear_project',
        'launch_fullscreen',
        'exit_fullscreen',
        'get_keycode_map'
        ,
        // NPI-inspired utility blocks
        'current_minute',
        'current_second',
        'user_agent',
        'page_title',
        'set_page_title',
        'object_count',
        'project_id',
        'project_name',
        'scene_count',
        'current_scene_name',
        'infinity_const',
        'max_of_two',
        'get_variable',
        'set_variable',
        'list_length',
        'list_item',
        'list_add_item',
        'list_clear',
        'list_index_of',
        'stop_project',
        'pause_project',
        'is_site_running',
        'open_url',

        // Newly added utility blocks for dates, math, strings, environment, and storage
        'current_hour',
        'current_day',
        'current_month',
        'current_year',
        'current_weekday',
        'random_float',
        'random_int_between',
        'math_round',
        'math_floor',
        'math_ceil',
        'math_sqrt',
        'string_length',
        'substring',
        'string_includes',
        'string_uppercase',
        'string_lowercase',
        'to_number',
        'to_string',
        'screen_width',
        'screen_height',
        'browser_language',
        'storage_get_item',
        'storage_set_item',
        'random_color'
        ,
        // Additional developer utility blocks that provide common programming helpers
        'min_of_two',
        'clamp_number',
        'random_boolean',
        'current_timestamp',
        'current_iso_datetime',
        'object_keys_count',
        'object_merge',
        'range_array',
        'array_slice',
        'array_concat',
        'array_sum',
        'type_of',
        'generate_uuid',
        'to_base64',
        'from_base64',
        'string_split',
        'array_join'
    ];
    if (!Entry.staticBlocks) {
        Entry.staticBlocks = [];
    }
    Entry.staticBlocks.push({
        category: DEV_CATEGORY,
        blocks: DEV_BLOCKS
    });
    // Preserve any existing dynamic blocks (e.g. hardware) by concatenating
    // them to our static list.  Without this, hardware blocks may be
    // dropped from the palette when our script runs.  See the Specialblock
    // example for reference【422189139003298†L280-L285】.
    if (EntryStatic.DynamicHardwareBlocks) {
        Entry.staticBlocks = Entry.staticBlocks.concat(EntryStatic.DynamicHardwareBlocks);
    }
    EntryStatic.getAllBlocks = () => Entry.staticBlocks;

    /**
     * Update category view helper.
     *
     * EntryJS internally caches category information in the block menu.
     * When adding a new category dynamically, we must regenerate the menu
     * and optionally assign a background image or label.  This helper
     * mirrors the pattern used in the Specialblock example【422189139003298†L286-L327】.
     *
     * @param {string} category   The identifier of the category to show
     * @param {Object} [options]  Additional styling options
     */
    const updateCategory = (category, options) => {
        // Construct the list of categories to display.  We default to
        // showing all built‑in categories.  Insert our category at the end.
        const defaultCategories = [
            'start',
            'flow',
            'moving',
            'looks',
            'brush',
            'text',
            'sound',
            'judgement',
            'calc',
            'variable',
            'func',
            'analysis',
            'ai_utilize',
            'expansion',
            'arduino'
        ];
        const categoryView = defaultCategories.map(name => ({ category: name, visible: true }));
        categoryView.push({ category: category, visible: true });
        // Generate the category UI
        Entry.playground.mainWorkspace.blockMenu._generateCategoryView(categoryView);
        // Remove selection styling from previously selected categories
        for (let i = 0; i < $('.entryCategoryElementWorkspace').length; i++) {
            const elem = $($('.entryCategoryElementWorkspace')[i]);
            if (elem.attr('id') !== 'entryCategorytext') {
                elem.attr('class', 'entryCategoryElementWorkspace');
            }
        }
        // Update category data and generate block code
        Entry.playground.blockMenu._categoryData = EntryStatic.getAllBlocks();
        Entry.playground.blockMenu._generateCategoryCode(category);
        // Apply optional styling (background image, name)
        if (options) {
            const idSelector = `#entryCategory${category}`;
            if (options.background) {
                $(idSelector).css('background-image', `url(${options.background})`);
                $(idSelector).css('background-repeat', 'no-repeat');
                if (options.backgroundSize) {
                    $(idSelector).css('background-size', `${options.backgroundSize}px`);
                }
            }
            if (options.name) {
                $(idSelector)[0].innerText = options.name;
            }
        }
    };

    // ---------------------------------------------------------------------
    // Block definition helper
    // ---------------------------------------------------------------------
    /**
     * Simplifies adding custom blocks by encapsulating repetitive properties.
     *
     * @param {string} blockname   Unique block identifier
     * @param {string} template    Display template with % placeholders
     * @param {Object} color       Object with `color` and `outerline` fields
     * @param {Object} params      Parameter configuration (params, def, map)
     * @param {string} _class      Classification for the block (optional)
     * @param {Function} func      Function called when block executes
     * @param {string} [skeleton]  Skeleton type (defaults to 'basic')
     */
    const addBlock = (blockname, template, color, params, _class, func, skeleton = 'basic') => {
        Entry.block[blockname] = {
            color: color.color,
            outerLine: color.outerline,
            skeleton: skeleton,
            statement: [],
            params: params.params,
            events: {},
            def: {
                params: params.def,
                type: blockname
            },
            paramsKeyMap: params.map,
            class: _class || 'default',
            func: func,
            template: template
        };
    };

    // Define a consistent colour scheme using Entry's built‑in palette.  We
    // reuse the HARDWAR colour set, as shown in the example code【422189139003298†L348-L359】.
    const blockColors = {
        color: EntryStatic.colorSet.block.default.HARDWAR,
        outerline: EntryStatic.colorSet.block.darken.HARDWAR
    };

    // ---------------------------------------------------------------------
    // Custom block implementations
    // ---------------------------------------------------------------------
    // 1. HTTP GET block – fetch text from a URL.  Returns the response
    //    body as a string.  Because this uses fetch, it returns a value
    //    asynchronously.  EntryJS handles promises returned by block
    //    functions.  We mark this block as a value block using the
    //    `basic_string_field` skeleton【769467075486655†L94-L116】.
    addBlock(
        'http_get',
        'URL %1 로 GET 요청',
        blockColors,
        {
            params: [
                {
                    type: 'Block',
                    accept: 'string'
                }
            ],
            def: [
                {
                    type: 'text',
                    params: ['https://example.com']
                }
            ],
            map: {
                URL: 0
            }
        },
        'text',
        async (sprite, script) => {
            const url = script.getValue('URL', script);
            try {
                const res = await fetch(url);
                // Attempt to read as text; fall back to JSON stringify if necessary
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const json = await res.json();
                    return JSON.stringify(json);
                }
                return await res.text();
            } catch (err) {
                return `Error: ${err.message}`;
            }
        },
        'basic_string_field'
    );

    // 2. JSON parse block – convert a JSON string into an object and
    //    immediately stringify it back to a pretty representation.  Many
    //    Entry blocks handle string output; here we return a stringified
    //    version of the parsed object for display.  The skeleton remains
    //    `basic_string_field` for value return【769467075486655†L94-L116】.
    addBlock(
        'json_parse',
        'JSON 문자열 %1 파싱',
        blockColors,
        {
            params: [
                {
                    type: 'Block',
                    accept: 'string'
                }
            ],
            def: [
                {
                    type: 'text',
                    params: ['{"key": "value"}']
                }
            ],
            map: {
                JSON_STR: 0
            }
        },
        'text',
        (sprite, script) => {
            const jsonStr = script.getValue('JSON_STR', script);
            try {
                const obj = JSON.parse(jsonStr);
                return JSON.stringify(obj);
            } catch (e) {
                return `JSON 오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 3. JSON stringify block – convert a JavaScript object literal string
    //    into a JSON string.  The user can supply any valid expression,
    //    which is evaluated using `eval`.  Because eval is dangerous, we
    //    recommend only using it for trusted inputs.  Returns the string
    //    representation of the object.  Value block skeleton.
    addBlock(
        'json_stringify',
        '객체 %1 JSON 문자열 변환',
        blockColors,
        {
            params: [
                {
                    type: 'Block',
                    accept: 'string'
                }
            ],
            def: [
                {
                    type: 'text',
                    params: ['{ foo: "bar" }']
                }
            ],
            map: {
                OBJ_EXPR: 0
            }
        },
        'text',
        (sprite, script) => {
            const expr = script.getValue('OBJ_EXPR', script);
            try {
                const obj = eval(`(${expr})`);
                return JSON.stringify(obj);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 4. Eval code block – evaluate arbitrary JavaScript and return the result
    //    as a string.  This is strictly for developers and should be used
    //    with caution.  We wrap the eval call in a try/catch and
    //    stringify the result so that objects and arrays display neatly.
    addBlock(
        'eval_code',
        '코드 실행 %1',
        blockColors,
        {
            params: [
                {
                    type: 'Block',
                    accept: 'string'
                }
            ],
            def: [
                {
                    type: 'text',
                    params: ['1 + 2']
                }
            ],
            map: {
                CODE: 0
            }
        },
        'text',
        (sprite, script) => {
            const code = script.getValue('CODE', script);
            try {
                const result = eval(code);
                // If result is an object, stringify it for display
                return typeof result === 'object' ? JSON.stringify(result) : String(result);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 5. Get property block – retrieve a property from an object.  Both
    //    arguments are evaluated expressions.  Returns the value of
    //    obj[prop].  Value block skeleton.
    addBlock(
        'get_property',
        '객체 %1 의 속성 %2 값',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' },
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['{ a: 1, b: 2 }'] },
                { type: 'text', params: ['"a"'] }
            ],
            map: {
                OBJ_EXPR: 0,
                PROP_EXPR: 1
            }
        },
        'text',
        (sprite, script) => {
            const objExpr = script.getValue('OBJ_EXPR', script);
            const propExpr = script.getValue('PROP_EXPR', script);
            try {
                const obj = eval(`(${objExpr})`);
                const prop = eval(propExpr);
                const result = obj[prop];
                return typeof result === 'object' ? JSON.stringify(result) : String(result);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 6. Set property block – assign a value to a property on an object.  This
    //    is a command block (skeleton 'basic') that does not return
    //    anything.  Useful when mutating stateful objects created in
    //    previous blocks.  It evaluates the object and property
    //    expressions and sets the property to the provided value.
    addBlock(
        'set_property',
        '객체 %1 속성 %2 를 %3 로 설정',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' },
                { type: 'Block', accept: 'string' },
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['globalThis'] },
                { type: 'text', params: ['"myVar"'] },
                { type: 'text', params: ['123'] }
            ],
            map: {
                OBJ_EXPR: 0,
                PROP_EXPR: 1,
                VALUE_EXPR: 2
            }
        },
        'command',
        (sprite, script) => {
            const objExpr = script.getValue('OBJ_EXPR', script);
            const propExpr = script.getValue('PROP_EXPR', script);
            const valueExpr = script.getValue('VALUE_EXPR', script);
            try {
                const obj = eval(`(${objExpr})`);
                const prop = eval(propExpr);
                const value = eval(valueExpr);
                obj[prop] = value;
            } catch (e) {
                // Swallow errors silently; command blocks do not return
                console.error(e);
            }
        },
        'basic'
    );

    // 7. Array get block – access an element in an array (1‑based index).
    //    Implementation mirrors the example in Specialblock【422189139003298†L390-L408】.
    addBlock(
        'array_get',
        '배열 %1 의 %2 번째 항목',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' },
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['[1, 2, 3]'] },
                { type: 'text', params: ['1'] }
            ],
            map: {
                ARRAY_EXPR: 0,
                INDEX_EXPR: 1
            }
        },
        'text',
        (sprite, script) => {
            const arrayExpr = script.getValue('ARRAY_EXPR', script);
            const indexExpr = script.getValue('INDEX_EXPR', script);
            try {
                const array = eval(`(${arrayExpr})`);
                const index = parseInt(eval(indexExpr), 10) - 1;
                const result = array[index];
                return typeof result === 'object' ? JSON.stringify(result) : String(result);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 8. Array length block – return the length of an array.  Value block.
    addBlock(
        'array_length',
        '배열 %1 의 길이',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['[1, 2, 3]'] }
            ],
            map: {
                ARRAY_EXPR: 0
            }
        },
        'text',
        (sprite, script) => {
            const arrayExpr = script.getValue('ARRAY_EXPR', script);
            try {
                const array = eval(`(${arrayExpr})`);
                return array.length;
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 9. Object keys block – return the keys of an object as a comma
    //    separated string.  Value block.
    addBlock(
        'object_keys',
        '객체 %1 의 키 목록',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['{ a: 1, b: 2 }'] }
            ],
            map: {
                OBJ_EXPR: 0
            }
        },
        'text',
        (sprite, script) => {
            const objExpr = script.getValue('OBJ_EXPR', script);
            try {
                const obj = eval(`(${objExpr})`);
                return Object.keys(obj).join(', ');
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 10. Console log block – log a value to the browser console.  Command
    //     block that does not return anything.  Accepts any expression
    //     string, evaluates it and prints the result via console.log.
    addBlock(
        'console_log',
        '콘솔에 %1 출력',
        blockColors,
        {
            params: [
                { type: 'Block', accept: 'string' }
            ],
            def: [
                { type: 'text', params: ['"Hello, EntryJS!"'] }
            ],
            map: {
                VALUE_EXPR: 0
            }
        },
        'command',
        (sprite, script) => {
            const valueExpr = script.getValue('VALUE_EXPR', script);
            try {
                const value = eval(valueExpr);
                console.log(value);
            } catch (e) {
                console.error(e);
            }
        },
        'basic'
    );

    // ---------------------------------------------------------------------
    // Entry API blocks
    //
    // These blocks expose a few of the core EntryJS API functions as
    // easy‑to‑use blocks.  The API descriptions are documented in the
    // official EntryJS documentation【310906088567486†L386-L465】.  Note
    // that some of these functions can have significant side effects on
    // the current project (e.g. clearing the workspace or switching to
    // fullscreen), so they should be used with care.

    // 11. Show toast block – display an alert, warning or success toast.
    //     Users select the toast type from a dropdown and supply a title
    //     and message.  The block is a command block (skeleton 'basic').
    addBlock(
        'show_toast',
        '토스트 %1 제목 %2 내용 %3',
        blockColors,
        {
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['alert', 'alert'],
                        ['warning', 'warning'],
                        ['success', 'success']
                    ],
                    fontSize: 11
                },
                {
                    type: 'Block',
                    accept: 'string'
                },
                {
                    type: 'Block',
                    accept: 'string'
                }
            ],
            def: [
                'alert',
                { type: 'text', params: ['제목'] },
                { type: 'text', params: ['메시지'] }
            ],
            map: {
                TYPE: 0,
                TITLE: 1,
                MESSAGE: 2
            }
        },
        'command',
        (sprite, script) => {
            const type = script.getField('TYPE', script);
            const title = script.getValue('TITLE', script);
            const message = script.getValue('MESSAGE', script);
            // Default to alert if the type is unknown
            switch (type) {
                case 'warning':
                    Entry.toast.warning(title, message, false);
                    break;
                case 'success':
                    Entry.toast.success(title, message, false);
                    break;
                default:
                    Entry.toast.alert(title, message, false);
            }
        },
        'basic'
    );

    // 12. Get uptime block – return the elapsed time since Entry.init.
    //     This uses Entry.getUpTime【310906088567486†L438-L446】.  Value block.
    addBlock(
        'get_uptime',
        '엔트리 실행 시간',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'text',
        (sprite, script) => {
            return Entry.getUpTime();
        },
        'basic_string_field'
    );

    // 13. Is default project block – check if the current project is the
    //     default project【310906088567486†L447-L453】.  Boolean value block.
    addBlock(
        'is_default_project',
        '기본 프로젝트인가?',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'text',
        () => {
            return Entry.isDefaultProject();
        },
        'basic_boolean_field'
    );

    // 14. Is mobile block – check if the environment is mobile【310906088567486†L459-L462】.  Boolean block.
    addBlock(
        'is_mobile',
        '모바일 환경인가?',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'text',
        () => {
            return Entry.isMobile();
        },
        'basic_boolean_field'
    );

    // 15. Export project block – export the current project as a JSON
    //     string【310906088567486†L170-L176】.  Value block.
    addBlock(
        'export_project',
        '프로젝트 내보내기',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'text',
        () => {
            try {
                const project = Entry.exportProject();
                return JSON.stringify(project);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // 16. Clear project block – clear the current workspace【310906088567486†L170-L183】.  Command block.
    addBlock(
        'clear_project',
        '프로젝트 초기화',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'command',
        () => {
            Entry.clearProject();
        },
        'basic'
    );

    // 17. Launch fullscreen block – switch EntryJS to fullscreen mode【310906088567486†L184-L188】.  Command block.
    addBlock(
        'launch_fullscreen',
        '전체 화면 모드',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'command',
        () => {
            Entry.launchFullScreen();
        },
        'basic'
    );

    // 18. Exit fullscreen block – exit fullscreen mode【310906088567486†L191-L195】.  Command block.
    addBlock(
        'exit_fullscreen',
        '전체 화면 종료',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'command',
        () => {
            Entry.exitFullScreen();
        },
        'basic'
    );

    // 19. Get keycode map block – return the keycode map as a JSON
    //     string【310906088567486†L431-L437】.  Value block.
    addBlock(
        'get_keycode_map',
        '키코드 맵 가져오기',
        blockColors,
        {
            params: [],
            def: [],
            map: {}
        },
        'text',
        () => {
            const map = Entry.getKeyCodeMap();
            return JSON.stringify(map);
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // NPI-inspired utility blocks
    //
    // These blocks are adapted from the public NPI Blocks project.  They
    // expose additional information about the current environment (such as
    // time, page metadata, project metadata, object counts, etc.) and
    // provide simple list and variable utilities.  See the original NPI
    // implementation for reference【608101523408047†L862-L874】【608101523408047†L892-L904】, 【608101523408047†L922-L926】,
    // 【608101523408047†L942-L947】, 【608101523408047†L998-L1004】, 【608101523408047†L1700-L1716】,
    // 【608101523408047†L1734-L1737】【608101523408047†L1754-L1757】, 【608101523408047†L1774-L1780】,
    // 【608101523408047†L1796-L1802】, 【608101523408047†L1076-L1079】, 【608101523408047†L1115-L1120】,
    // 【608101523408047†L1669-L1688】.

    // Current minute (zero‑padded)
    addBlock(
        'current_minute',
        '현재 시각 (분)',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            const date = new Date();
            let m = date.getMinutes();
            return m < 10 ? `0${m}` : String(m);
        },
        'basic_string_field'
    );

    // Current second (zero‑padded)
    addBlock(
        'current_second',
        '현재 시각 (초)',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            const date = new Date();
            let s = date.getSeconds();
            return s < 10 ? `0${s}` : String(s);
        },
        'basic_string_field'
    );

    // User agent string
    addBlock(
        'user_agent',
        '유저 에이전트',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.userAgent || navigator.userAgent;
        },
        'basic_string_field'
    );

    // Get page title
    addBlock(
        'page_title',
        '페이지 제목',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return document.title;
        },
        'basic_string_field'
    );

    // Set page title
    addBlock(
        'set_page_title',
        '페이지 제목을 %1 으로 설정',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['새 제목'] } ],
            map: { TITLE: 0 }
        },
        'command',
        (sprite, script) => {
            document.title = script.getValue('TITLE', script);
        },
        'basic'
    );

    // Count objects in the current project【608101523408047†L1700-L1716】
    addBlock(
        'object_count',
        '오브젝트 수',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.container.getAllObjects().length;
        },
        'basic_string_field'
    );

    // Project ID【608101523408047†L1734-L1737】
    addBlock(
        'project_id',
        '프로젝트 아이디',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.projectId;
        },
        'basic_string_field'
    );

    // Project name【608101523408047†L1754-L1757】
    addBlock(
        'project_name',
        '프로젝트 이름',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.projectName;
        },
        'basic_string_field'
    );

    // Scene count【608101523408047†L1774-L1780】
    addBlock(
        'scene_count',
        '장면 수',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.scene.getScenes().length;
        },
        'basic_string_field'
    );

    // Current scene name【608101523408047†L1796-L1802】
    addBlock(
        'current_scene_name',
        '현재 장면 이름',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            const scene = Entry.scene.selectedScene;
            return scene && scene.name ? scene.name : '';
        },
        'basic_string_field'
    );

    // Infinity constant【608101523408047†L1076-L1079】
    addBlock(
        'infinity_const',
        'Infinity',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Infinity;
        },
        'basic_string_field'
    );

    // Maximum of two numbers【608101523408047†L1115-L1120】
    addBlock(
        'max_of_two',
        '%1 과 %2 중 큰 수',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['1'] }, { type: 'text', params: ['2'] } ],
            map: { X: 0, Y: 1 }
        },
        'text',
        (sprite, script) => {
            const x = Number(script.getValue('X', script));
            const y = Number(script.getValue('Y', script));
            return Math.max(x, y);
        },
        'basic_string_field'
    );

    // Get variable value by name
    addBlock(
        'get_variable',
        '%1 이름의 변수 값',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['변수'] } ],
            map: { VARNAME: 0 }
        },
        'text',
        () => {},
        'basic_string_field'
    );

    // Set variable value by name
    addBlock(
        'set_variable',
        '%1 이름의 변수를 %2 로 정하기',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['변수'] }, { type: 'text', params: ['0'] } ],
            map: { VARNAME: 0, VALUE: 1 }
        },
        'command',
        () => {},
        'basic'
    );

    // List length
    addBlock(
        'list_length',
        '%1 이름의 리스트 항목 수',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['리스트'] } ],
            map: { LISTNAME: 0 }
        },
        'text',
        () => {},
        'basic_string_field'
    );

    // Get list item
    addBlock(
        'list_item',
        '%1 이름의 리스트 %2 번째 항목',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['리스트'] }, { type: 'text', params: ['1'] } ],
            map: { LISTNAME: 0, INDEX: 1 }
        },
        'text',
        () => {},
        'basic_string_field'
    );

    // Add item to list
    addBlock(
        'list_add_item',
        '%1 항목을 %2 이름의 리스트에 추가',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['값'] }, { type: 'text', params: ['리스트'] } ],
            map: { VALUE: 0, LISTNAME: 1 }
        },
        'command',
        () => {},
        'basic'
    );

    // Clear list
    addBlock(
        'list_clear',
        '%1 이름의 리스트 초기화',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['리스트'] } ],
            map: { LISTNAME: 0 }
        },
        'command',
        () => {},
        'basic'
    );

    // Find index of item in list【608101523408047†L1669-L1688】
    addBlock(
        'list_index_of',
        '%1 이름의 리스트에서 %2 항목 위치',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['리스트'] }, { type: 'text', params: ['값'] } ],
            map: { LISTNAME: 0, SEARCH: 1 }
        },
        'text',
        () => {},
        'basic_string_field'
    );

    // Stop project (toggle stop) similar to NPI 'stop' block【608101523408047†L1836-L1868】
    addBlock(
        'stop_project',
        '작품 정지',
        blockColors,
        { params: [], def: [], map: {} },
        'command',
        () => {
            Entry.engine.toggleStop();
        },
        'basic'
    );

    // Pause or resume project【608101523408047†L1896-L1902】
    addBlock(
        'pause_project',
        '작품 일시정지',
        blockColors,
        { params: [], def: [], map: {} },
        'command',
        () => {
            Entry.engine.togglePause();
        },
        'basic'
    );

    // Check if running on a given site【608101523408047†L1910-L1949】
    addBlock(
        'is_site_running',
        '%1 사이트에서 실행하는가?',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['example.com'] } ],
            map: { SITE: 0 }
        },
        'text',
        (sprite, script) => {
            const target = script.getValue('SITE', script).toLowerCase();
            const host = window.location.hostname.toLowerCase();
            const ua = navigator.userAgent.toLowerCase();
            return host.includes(target) || ua.includes(target);
        },
        'basic_boolean_field'
    );

    // Open a URL in a new tab (similar to NPI 'site' block)
    addBlock(
        'open_url',
        '웹 주소 %1 열기',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['https://playentry.org/'] } ],
            map: { URL: 0 }
        },
        'command',
        (sprite, script) => {
            const url = script.getValue('URL', script);
            try {
                window.open(url, '_blank');
            } catch (e) {
                console.error(e);
            }
        },
        'basic'
    );

    // ---------------------------------------------------------------------
    // Additional date/time blocks
    // ---------------------------------------------------------------------
    // Returns the current hour (00-23) as a string
    addBlock(
        'current_hour',
        '현재 시',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            // getHours returns the hour (0–23) according to local time【854077714457006†L187-L219】
            return String(d.getHours()).padStart(2, '0');
        },
        'basic_string_field'
    );

    // Returns the current day of the month (01-31) as a string
    addBlock(
        'current_day',
        '현재 일',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            // getDate returns the day of the month from 1–31【692120372088196†L187-L210】
            return String(d.getDate()).padStart(2, '0');
        },
        'basic_string_field'
    );

    // Returns the current month (01-12) as a string.  Date.getMonth() is zero‑based【33407994100977†L187-L213】.
    addBlock(
        'current_month',
        '현재 월',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            return String(d.getMonth() + 1).padStart(2, '0');
        },
        'basic_string_field'
    );

    // Returns the current year as a four‑digit string【990619095957855†L187-L219】
    addBlock(
        'current_year',
        '현재 연도',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            return String(d.getFullYear());
        },
        'basic_string_field'
    );

    // Returns the current day of week (0–6 where 0 is Sunday)【371363214208438†L187-L213】
    addBlock(
        'current_weekday',
        '현재 요일 (0=일요일)',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            return String(d.getDay());
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // Random number and math blocks
    // ---------------------------------------------------------------------
    // Returns a random floating‑point number between 0 (inclusive) and 1 (exclusive)【602974568644677†L187-L216】
    addBlock(
        'random_float',
        '무작위 소수',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Math.random();
        },
        'basic_string_field'
    );

    // Returns a random integer between two values inclusive
    addBlock(
        'random_int_between',
        '무작위 정수 %1 부터 %2',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['1'] }, { type: 'text', params: ['10'] } ],
            map: { MIN: 0, MAX: 1 }
        },
        'analysis',
        (sprite, script) => {
            const min = Number(script.getValue('MIN', script));
            const max = Number(script.getValue('MAX', script));
            const lo = Math.ceil(Math.min(min, max));
            const hi = Math.floor(Math.max(min, max));
            // inclusive range using Math.random() formula【602974568644677†L187-L216】
            return Math.floor(Math.random() * (hi - lo + 1)) + lo;
        },
        'basic_string_field'
    );

    // Round a number to the nearest integer using Math.round()【169848620167509†L187-L213】
    addBlock(
        'math_round',
        '반올림 %1',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['3.14'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const x = Number(script.getValue('VALUE', script));
            return Math.round(x);
        },
        'basic_string_field'
    );

    // Floor a number (round down) using Math.floor()【703229753870293†L187-L213】
    addBlock(
        'math_floor',
        '내림 %1',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['3.9'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const x = Number(script.getValue('VALUE', script));
            return Math.floor(x);
        },
        'basic_string_field'
    );

    // Ceil a number (round up) using Math.ceil()【974893183198530†L187-L213】
    addBlock(
        'math_ceil',
        '올림 %1',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['3.1'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const x = Number(script.getValue('VALUE', script));
            return Math.ceil(x);
        },
        'basic_string_field'
    );

    // Compute square root using Math.sqrt()【937862952094458†L187-L211】
    addBlock(
        'math_sqrt',
        '제곱근 %1',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['9'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const x = Number(script.getValue('VALUE', script));
            return Math.sqrt(x);
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // String manipulation blocks
    // ---------------------------------------------------------------------
    // Return the length of a string using the length property【173178604627789†L187-L188】
    addBlock(
        'string_length',
        '문자열 %1 길이',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['hello'] } ],
            map: { STR: 0 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            return str.length;
        },
        'basic_string_field'
    );

    // Extract a substring from start to end (1‑based indices)
    addBlock(
        'substring',
        '문자열 %1 부분 %2 부터 %3 까지',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['hello world'] }, { type: 'text', params: ['1'] }, { type: 'text', params: ['5'] } ],
            map: { STR: 0, START: 1, END: 2 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            let start = Number(script.getValue('START', script)) - 1;
            let end = Number(script.getValue('END', script));
            if (isNaN(start) || start < 0) start = 0;
            if (isNaN(end) || end <= 0) end = str.length;
            // substring returns the part of the string from start up to but excluding end【476442332346209†L187-L217】
            return str.substring(start, end);
        },
        'basic_string_field'
    );

    // Check if a string contains another string using String.includes()【996137871167531†L187-L189】
    addBlock(
        'string_includes',
        '문자열 %1 에 %2 포함?',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['hello world'] }, { type: 'text', params: ['world'] } ],
            map: { STR: 0, SEARCH: 1 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            const search = String(script.getValue('SEARCH', script));
            return str.includes(search);
        },
        'basic_boolean_field'
    );

    // Convert string to uppercase【433324581644623†L187-L210】
    addBlock(
        'string_uppercase',
        '문자열 %1 대문자 변환',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['hello'] } ],
            map: { STR: 0 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            return str.toUpperCase();
        },
        'basic_string_field'
    );

    // Convert string to lowercase【224288948721045†L187-L215】
    addBlock(
        'string_lowercase',
        '문자열 %1 소문자 변환',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['HELLO'] } ],
            map: { STR: 0 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            return str.toLowerCase();
        },
        'basic_string_field'
    );

    // Convert a value to a number using Number()【275533574888864†L186-L217】
    addBlock(
        'to_number',
        '값 %1 숫자로',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['"42"'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const value = script.getValue('VALUE', script);
            return Number(value);
        },
        'basic_string_field'
    );

    // Convert a value to a string
    addBlock(
        'to_string',
        '값 %1 문자열로',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['123'] } ],
            map: { VALUE: 0 }
        },
        'calc',
        (sprite, script) => {
            const value = script.getValue('VALUE', script);
            return String(value);
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // Environment information blocks
    // ---------------------------------------------------------------------
    // Return the screen width in CSS pixels【266471493358716†L185-L186】
    addBlock(
        'screen_width',
        '화면 너비',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return window.screen.width;
        },
        'basic_string_field'
    );

    // Return the screen height in CSS pixels (similar to Screen.height)
    addBlock(
        'screen_height',
        '화면 높이',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return window.screen.height;
        },
        'basic_string_field'
    );

    // Return the browser's preferred language【988774608137001†L185-L187】
    addBlock(
        'browser_language',
        '브라우저 언어',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return navigator.language;
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // Web Storage blocks
    // ---------------------------------------------------------------------
    // Retrieve a value from localStorage【371751712948230†L185-L207】
    addBlock(
        'storage_get_item',
        '스토리지에서 %1 값',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['key'] } ],
            map: { KEY: 0 }
        },
        'text',
        (sprite, script) => {
            const key = String(script.getValue('KEY', script));
            return localStorage.getItem(key) || '';
        },
        'basic_string_field'
    );

    // Set a value in localStorage【803941998277166†L185-L187】
    addBlock(
        'storage_set_item',
        '스토리지 %1 에 값 %2 저장',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['key'] }, { type: 'text', params: ['value'] } ],
            map: { KEY: 0, VALUE: 1 }
        },
        'command',
        (sprite, script) => {
            const key = String(script.getValue('KEY', script));
            const value = script.getValue('VALUE', script);
            localStorage.setItem(key, value);
        },
        'basic'
    );

    // ---------------------------------------------------------------------
    // Colour utility block
    // ---------------------------------------------------------------------
    // Generate a random hex colour string (e.g. #A1B2C3)
    addBlock(
        'random_color',
        '무작위 색상',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const n = Math.floor(Math.random() * 0x1000000);
            const hex = n.toString(16).padStart(6, '0');
            return '#' + hex;
        },
        'basic_string_field'
    );

    // ---------------------------------------------------------------------
    // Additional helper blocks
    // These blocks implement miscellaneous utilities that are often useful
    // when writing more complex programs.  Each block is annotated with
    // citations from MDN documentation describing the underlying
    // JavaScript APIs.  Use them to simplify common tasks.

    // Return the smaller of two numbers using Math.min()【745298443217660†L354-L360】
    addBlock(
        'min_of_two',
        '두 수 중 작은 값 %1 %2',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['3'] }, { type: 'text', params: ['5'] } ],
            map: { A: 0, B: 1 }
        },
        'calc',
        (sprite, script) => {
            const a = Number(script.getValue('A', script));
            const b = Number(script.getValue('B', script));
            return Math.min(a, b);
        },
        'basic_string_field'
    );

    // Clamp a number between a minimum and maximum
    // Uses Math.min/Math.max to bound the value【745298443217660†L354-L360】
    addBlock(
        'clamp_number',
        '값 %1 을 %2 이상 %3 이하로 제한',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['50'] }, { type: 'text', params: ['0'] }, { type: 'text', params: ['100'] } ],
            map: { VALUE: 0, MIN: 1, MAX: 2 }
        },
        'calc',
        (sprite, script) => {
            const v = Number(script.getValue('VALUE', script));
            const min = Number(script.getValue('MIN', script));
            const max = Number(script.getValue('MAX', script));
            return Math.min(Math.max(v, min), max);
        },
        'basic_string_field'
    );

    // Generate a random boolean using Math.random()【745298443217660†L366-L368】
    addBlock(
        'random_boolean',
        '무작위 참/거짓',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Math.random() >= 0.5;
        },
        'basic_boolean_field'
    );

    // Current timestamp in milliseconds since the epoch【70123868884268†L208-L211】
    addBlock(
        'current_timestamp',
        '현재 타임스탬프',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Date.now();
        },
        'basic_string_field'
    );

    // Current ISO 8601 formatted datetime string【386903377069027†L187-L191】
    addBlock(
        'current_iso_datetime',
        '현재 ISO 날짜시간',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return new Date().toISOString();
        },
        'basic_string_field'
    );

    // Count the number of own enumerable keys on an object【732278019155262†L187-L220】
    addBlock(
        'object_keys_count',
        '객체 %1 키 개수',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['{ a: 1, b: 2 }'] } ],
            map: { OBJ_EXPR: 0 }
        },
        'analysis',
        (sprite, script) => {
            try {
                const obj = eval(`(${script.getValue('OBJ_EXPR', script)})`);
                return Object.keys(obj).length;
            } catch (e) {
                return 0;
            }
        },
        'basic_string_field'
    );

    // Merge two objects using Object.assign()【436255912355150†L187-L189】
    addBlock(
        'object_merge',
        '객체 %1 와 %2 합치기',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['{ x: 1 }'] }, { type: 'text', params: ['{ y: 2 }'] } ],
            map: { OBJ1: 0, OBJ2: 1 }
        },
        'text',
        (sprite, script) => {
            try {
                const obj1 = eval(`(${script.getValue('OBJ1', script)})`);
                const obj2 = eval(`(${script.getValue('OBJ2', script)})`);
                const merged = Object.assign({}, obj1, obj2);
                return JSON.stringify(merged);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // Generate an array of numbers from start to end with a given step
    // Uses Array.from() to produce a shallow-copied array【929943193353724†L187-L189】
    addBlock(
        'range_array',
        '범위 배열 %1 부터 %2 까지 간격 %3',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['1'] }, { type: 'text', params: ['5'] }, { type: 'text', params: ['1'] } ],
            map: { START: 0, END: 1, STEP: 2 }
        },
        'analysis',
        (sprite, script) => {
            const start = Number(script.getValue('START', script));
            const end = Number(script.getValue('END', script));
            let step = Number(script.getValue('STEP', script));
            if (!step) step = 1;
            const arr = [];
            if (step > 0) {
                for (let i = start; i <= end; i += step) arr.push(i);
            } else if (step < 0) {
                for (let i = start; i >= end; i += step) arr.push(i);
            }
            return JSON.stringify(arr);
        },
        'basic_string_field'
    );

    // Slice a portion of an array【871398334227420†L187-L190】
    addBlock(
        'array_slice',
        '배열 %1 부분 %2 부터 %3 까지',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['[1,2,3,4,5]'] }, { type: 'text', params: ['2'] }, { type: 'text', params: ['4'] } ],
            map: { ARRAY_EXPR: 0, START: 1, END: 2 }
        },
        'analysis',
        (sprite, script) => {
            try {
                const arr = eval(`(${script.getValue('ARRAY_EXPR', script)})`);
                const start = Number(script.getValue('START', script)) - 1;
                let end = Number(script.getValue('END', script));
                if (isNaN(end)) {
                    end = undefined;
                }
                // slice uses end index (not inclusive) and zero-based start
                const sliced = arr.slice(start, end ? end : undefined);
                return JSON.stringify(sliced);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // Concatenate two arrays【586262527602940†L187-L189】
    addBlock(
        'array_concat',
        '배열 %1 과 %2 합치기',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['[1,2]'] }, { type: 'text', params: ['[3,4]'] } ],
            map: { ARR1: 0, ARR2: 1 }
        },
        'analysis',
        (sprite, script) => {
            try {
                const arr1 = eval(`(${script.getValue('ARR1', script)})`);
                const arr2 = eval(`(${script.getValue('ARR2', script)})`);
                const result = arr1.concat(arr2);
                return JSON.stringify(result);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    // Sum all numeric elements in an array using reduce()【563092013807589†L187-L190】
    addBlock(
        'array_sum',
        '배열 %1 합계',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['[1,2,3]'] } ],
            map: { ARRAY_EXPR: 0 }
        },
        'calc',
        (sprite, script) => {
            try {
                const arr = eval(`(${script.getValue('ARRAY_EXPR', script)})`);
                const sum = arr.reduce((acc, val) => acc + Number(val), 0);
                return sum;
            } catch (e) {
                return 0;
            }
        },
        'basic_string_field'
    );

    // Return the type of a value using typeof【721228052876061†L186-L187】
    addBlock(
        'type_of',
        '%1 의 타입',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['123'] } ],
            map: { VALUE: 0 }
        },
        'analysis',
        (sprite, script) => {
            try {
                const value = eval(script.getValue('VALUE', script));
                return typeof value;
            } catch (e) {
                return 'undefined';
            }
        },
        'basic_string_field'
    );

    // Generate a cryptographically secure UUID【88879990316380†L190-L209】
    addBlock(
        'generate_uuid',
        '무작위 UUID 생성',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID();
            }
            // Fallback UUID v4 generator
            const s = [];
            const hex = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            for (let i = 0; i < hex.length; i++) {
                const c = hex[i];
                if (c === 'x' || c === 'y') {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    s.push(v.toString(16));
                } else {
                    s.push(c);
                }
            }
            return s.join('');
        },
        'basic_string_field'
    );

    // Encode a string to Base64 using btoa()【198049400293323†L187-L194】
    addBlock(
        'to_base64',
        '문자열 %1 Base64 인코딩',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['hello'] } ],
            map: { STR: 0 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            try {
                // Encode to UTF-8 then base64
                return btoa(unescape(encodeURIComponent(str)));
            } catch (e) {
                return '';
            }
        },
        'basic_string_field'
    );

    // Decode a Base64 string using atob()【496004071715597†L185-L188】
    addBlock(
        'from_base64',
        'Base64 문자열 %1 디코딩',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['aGVsbG8='] } ],
            map: { B64: 0 }
        },
        'text',
        (sprite, script) => {
            const b64 = String(script.getValue('B64', script));
            try {
                const decoded = atob(b64);
                return decodeURIComponent(escape(decoded));
            } catch (e) {
                return '';
            }
        },
        'basic_string_field'
    );

    // Split a string into an array based on a delimiter
    addBlock(
        'string_split',
        '문자열 %1 을 %2 로 나누기',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['a,b,c'] }, { type: 'text', params: [','] } ],
            map: { STR: 0, DELIM: 1 }
        },
        'text',
        (sprite, script) => {
            const str = String(script.getValue('STR', script));
            const delim = String(script.getValue('DELIM', script));
            return JSON.stringify(str.split(delim));
        },
        'basic_string_field'
    );

    // Join an array into a string with a separator
    addBlock(
        'array_join',
        '배열 %1 요소를 %2 로 연결',
        blockColors,
        {
            params: [ { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' } ],
            def: [ { type: 'text', params: ['["a","b","c"]'] }, { type: 'text', params: [','] } ],
            map: { ARRAY_EXPR: 0, SEP: 1 }
        },
        'text',
        (sprite, script) => {
            try {
                const arr = eval(`(${script.getValue('ARRAY_EXPR', script)})`);
                const sep = String(script.getValue('SEP', script));
                return arr.join(sep);
            } catch (e) {
                return '';
            }
        },
        'basic_string_field'
    );

    // Implementations for variable and list operations
    // These functions are defined separately because they reference
    // Entry.variableContainer which may not exist at definition time.
    Entry.addEventListener('loadComplete', () => {
        // Get variable value by name
        Entry.block.get_variable.func = (sprite, script) => {
            const name = script.getValue('VARNAME', script);
            const variable = Entry.variableContainer.getVariableByName(name);
            return variable ? String(variable.getValue()) : '';
        };
        // Set variable value by name
        Entry.block.set_variable.func = (sprite, script) => {
            const name = script.getValue('VARNAME', script);
            const value = script.getValue('VALUE', script);
            let variable = Entry.variableContainer.getVariableByName(name);
            if (!variable) {
                // Create a new variable if it doesn't exist
                variable = Entry.variableContainer.addVariable({
                    name: name,
                    id: Entry.variableContainer.generateVariableId(),
                    variableType: 'variable',
                    isCloud: false,
                    value: 0,
                    scope: 'global'
                });
            }
            variable.setValue(value);
        };
        // List length
        Entry.block.list_length.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            return list ? list.getArray().length : 0;
        };
        // Get list item
        Entry.block.list_item.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const index = Number(script.getValue('INDEX', script));
            const list = Entry.variableContainer.getListByName(name);
            if (!list) return '';
            const arr = list.getArray();
            const item = arr[index - 1];
            return item ? String(item.data) : '';
        };
        // Add item to list
        Entry.block.list_add_item.func = (sprite, script) => {
            const value = script.getValue('VALUE', script);
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            if (list) {
                list.appendValue(value);
            }
        };
        // Clear list
        Entry.block.list_clear.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            if (list) {
                while (list.getArray().length > 0) {
                    list.deleteValue(1);
                }
            }
        };
        // Find index of item in list
        Entry.block.list_index_of.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const search = script.getValue('SEARCH', script);
            const list = Entry.variableContainer.getListByName(name);
            if (!list) return 0;
            const arr = list.getArray();
            for (let i = 0; i < arr.length; i++) {
                if (String(arr[i].data) === String(search)) {
                    return i + 1;
                }
            }
            return 0;
        };
    });

    // Finally, update the palette to show our new category.  Provide a
    // friendly display name in Korean (개발자) and reuse a generic icon
    // from Entry’s hardware palette to differentiate the tab.  If you
    // wish to customise the icon, replace the URL below with your own.
    //
    // NOTE: When this script is executed before Entry’s playground is
    // fully initialised, calling `updateCategory` immediately can
    // cause an error because `Entry.playground` or its `mainWorkspace`
    // property may not yet exist.  To address this, wrap the call in
    // a polling helper that waits until the necessary objects are
    // available.  This mirrors the load‑timing logic in the
    // Specialblock example and prevents the block palette from
    // disappearing if the script runs too early.
    const tryUpdateDevCategory = () => {
        if (typeof Entry !== 'undefined' &&
            Entry.playground &&
            Entry.playground.mainWorkspace &&
            Entry.playground.blockMenu) {
            updateCategory(DEV_CATEGORY, {
                name: '개발자',
                background: '/lib/entry-js/images/hardware.svg',
                backgroundSize: 32
            });
        } else {
            setTimeout(tryUpdateDevCategory, 100);
        }
    };
    tryUpdateDevCategory();
})();