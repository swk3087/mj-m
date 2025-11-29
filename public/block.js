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
        'open_url'
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
    updateCategory(DEV_CATEGORY, {
        name: '개발자',
        background: '/lib/entry-js/images/hardware.svg',
        backgroundSize: 32
    });
})();