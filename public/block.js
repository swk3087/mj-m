(() => {
    const DEV_CATEGORY = 'developer';
    const DEV_BLOCKS = [
        'CB_http_get',
        'CB_json_parse',
        'CB_json_stringify',
        'CB_eval_code',
        'CB_get_property',
        'CB_set_property',
        'CB_array_get',
        'CB_array_length',
        'CB_object_keys',
        'CB_console_log',
        'CB_show_toast',
        'CB_get_uptime',
        'CB_is_default_project',
        'CB_is_mobile',
        'CB_export_project',
        'CB_clear_project',
        'CB_launch_fullscreen',
        'CB_exit_fullscreen',
        'CB_get_keycode_map',
        'CB_current_minute',
        'CB_current_second',
        'CB_user_agent',
        'CB_page_title',
        'CB_set_page_title',
        'CB_object_count',
        'CB_project_id',
        'CB_project_name',
        'CB_scene_count',
        'CB_current_scene_name',
        'CB_infinity_const',
        'CB_max_of_two',
        'CB_get_variable',
        'CB_set_variable',
        'CB_list_length',
        'CB_list_item',
        'CB_list_add_item',
        'CB_list_clear',
        'CB_list_index_of',
        'CB_stop_project',
        'CB_pause_project',
        'CB_is_site_running',
        'CB_open_url',
        'CB_current_hour',
        'CB_current_day',
        'CB_current_month',
        'CB_current_year',
        'CB_current_weekday',
        'CB_random_float',
        'CB_random_int_between',
        'CB_math_round',
        'CB_math_floor',
        'CB_math_ceil',
        'CB_math_sqrt',
        'CB_string_length',
        'CB_substring',
        'CB_string_includes',
        'CB_string_uppercase',
        'CB_string_lowercase',
        'CB_to_number',
        'CB_to_string',
        'CB_screen_width',
        'CB_screen_height',
        'CB_browser_language',
        'CB_storage_get_item',
        'CB_storage_set_item',
        'CB_random_color',
        'CB_min_of_two',
        'CB_clamp_number',
        'CB_random_boolean',
        'CB_current_timestamp',
        'CB_current_iso_datetime',
        'CB_object_keys_count',
        'CB_object_merge',
        'CB_range_array',
        'CB_array_slice',
        'CB_array_concat',
        'CB_array_sum',
        'CB_type_of',
        'CB_generate_uuid',
        'CB_to_base64',
        'CB_from_base64',
        'CB_string_split',
        'CB_array_join'
    ];

    if (!Entry.staticBlocks) {
        Entry.staticBlocks = [];
    }

    Entry.staticBlocks.push({
        category: DEV_CATEGORY,
        blocks: DEV_BLOCKS
    });

    if (EntryStatic.DynamicHardwareBlocks) {
        Entry.staticBlocks = Entry.staticBlocks.concat(EntryStatic.DynamicHardwareBlocks);
    }

    EntryStatic.getAllBlocks = () => Entry.staticBlocks;

    const updateCategory = (category, options) => {
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

        Entry.playground.mainWorkspace.blockMenu._generateCategoryView(categoryView);

        for (let i = 0; i < $('.entryCategoryElementWorkspace').length; i++) {
            const elem = $($('.entryCategoryElementWorkspace')[i]);
            if (elem.attr('id') !== 'entryCategorytext') {
                elem.attr('class', 'entryCategoryElementWorkspace');
            }
        }

        Entry.playground.blockMenu._categoryData = EntryStatic.getAllBlocks();
        Entry.playground.blockMenu._generateCategoryCode(category);

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

    const blockColors = {
        color: EntryStatic.colorSet.block.default.HARDWAR,
        outerline: EntryStatic.colorSet.block.darken.HARDWAR
    };

    addBlock(
        'CB_http_get',
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

    addBlock(
        'CB_json_parse',
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

    addBlock(
        'CB_json_stringify',
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

    addBlock(
        'CB_eval_code',
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
                return typeof result === 'object' ? JSON.stringify(result) : String(result);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    addBlock(
        'CB_get_property',
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

    addBlock(
        'CB_set_property',
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
                console.error(e);
            }
        },
        'basic'
    );

    addBlock(
        'CB_array_get',
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

    addBlock(
        'CB_array_length',
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

    addBlock(
        'CB_object_keys',
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

    addBlock(
        'CB_console_log',
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

    addBlock(
        'CB_show_toast',
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

    addBlock(
        'CB_get_uptime',
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

    addBlock(
        'CB_is_default_project',
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

    addBlock(
        'CB_is_mobile',
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

    addBlock(
        'CB_export_project',
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

    addBlock(
        'CB_clear_project',
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

    addBlock(
        'CB_launch_fullscreen',
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

    addBlock(
        'CB_exit_fullscreen',
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

    addBlock(
        'CB_get_keycode_map',
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

    addBlock(
        'CB_current_minute',
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

    addBlock(
        'CB_current_second',
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

    addBlock(
        'CB_user_agent',
        '유저 에이전트',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.userAgent || navigator.userAgent;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_page_title',
        '페이지 제목',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return document.title;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_set_page_title',
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

    addBlock(
        'CB_object_count',
        '오브젝트 수',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.container.getAllObjects().length;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_project_id',
        '프로젝트 아이디',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.projectId;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_project_name',
        '프로젝트 이름',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.projectName;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_scene_count',
        '장면 수',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Entry.scene.getScenes().length;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_current_scene_name',
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

    addBlock(
        'CB_infinity_const',
        'Infinity',
        blockColors,
        { params: [], def: [], map: {} },
        'text',
        () => {
            return Infinity;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_max_of_two',
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

    addBlock(
        'CB_get_variable',
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

    addBlock(
        'CB_set_variable',
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

    addBlock(
        'CB_list_length',
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

    addBlock(
        'CB_list_item',
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

    addBlock(
        'CB_list_add_item',
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

    addBlock(
        'CB_list_clear',
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

    addBlock(
        'CB_list_index_of',
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

    addBlock(
        'CB_stop_project',
        '작품 정지',
        blockColors,
        { params: [], def: [], map: {} },
        'command',
        () => {
            Entry.engine.toggleStop();
        },
        'basic'
    );

    addBlock(
        'CB_pause_project',
        '작품 일시정지',
        blockColors,
        { params: [], def: [], map: {} },
        'command',
        () => {
            Entry.engine.togglePause();
        },
        'basic'
    );

    addBlock(
        'CB_is_site_running',
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

    addBlock(
        'CB_open_url',
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

    addBlock(
        'CB_current_hour',
        '현재 시',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            return String(d.getHours()).padStart(2, '0');
        },
        'basic_string_field'
    );

    addBlock(
        'CB_current_day',
        '현재 일',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            const d = new Date();
            return String(d.getDate()).padStart(2, '0');
        },
        'basic_string_field'
    );

    addBlock(
        'CB_current_month',
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

    addBlock(
        'CB_current_year',
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

    addBlock(
        'CB_current_weekday',
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

    addBlock(
        'CB_random_float',
        '무작위 소수',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Math.random();
        },
        'basic_string_field'
    );

    addBlock(
        'CB_random_int_between',
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
            return Math.floor(Math.random() * (hi - lo + 1)) + lo;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_math_round',
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

    addBlock(
        'CB_math_floor',
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

    addBlock(
        'CB_math_ceil',
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

    addBlock(
        'CB_math_sqrt',
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

    addBlock(
        'CB_string_length',
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

    addBlock(
        'CB_substring',
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
            return str.substring(start, end);
        },
        'basic_string_field'
    );

    addBlock(
        'CB_string_includes',
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

    addBlock(
        'CB_string_uppercase',
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

    addBlock(
        'CB_string_lowercase',
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

    addBlock(
        'CB_to_number',
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

    addBlock(
        'CB_to_string',
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

    addBlock(
        'CB_screen_width',
        '화면 너비',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return window.screen.width;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_screen_height',
        '화면 높이',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return window.screen.height;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_browser_language',
        '브라우저 언어',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return navigator.language;
        },
        'basic_string_field'
    );

    addBlock(
        'CB_storage_get_item',
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

    addBlock(
        'CB_storage_set_item',
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

    addBlock(
        'CB_random_color',
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

    addBlock(
        'CB_min_of_two',
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

    addBlock(
        'CB_clamp_number',
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

    addBlock(
        'CB_random_boolean',
        '무작위 참/거짓',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Math.random() >= 0.5;
        },
        'basic_boolean_field'
    );

    addBlock(
        'CB_current_timestamp',
        '현재 타임스탬프',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return Date.now();
        },
        'basic_string_field'
    );

    addBlock(
        'CB_current_iso_datetime',
        '현재 ISO 날짜시간',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            return new Date().toISOString();
        },
        'basic_string_field'
    );

    addBlock(
        'CB_object_keys_count',
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

    addBlock(
        'CB_object_merge',
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

    addBlock(
        'CB_range_array',
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

    addBlock(
        'CB_array_slice',
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
                const sliced = arr.slice(start, end ? end : undefined);
                return JSON.stringify(sliced);
            } catch (e) {
                return `오류: ${e.message}`;
            }
        },
        'basic_string_field'
    );

    addBlock(
        'CB_array_concat',
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

    addBlock(
        'CB_array_sum',
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

    addBlock(
        'CB_type_of',
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

    addBlock(
        'CB_generate_uuid',
        '무작위 UUID 생성',
        blockColors,
        { params: [], def: [], map: {} },
        'analysis',
        () => {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID();
            }
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

    addBlock(
        'CB_to_base64',
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
                return btoa(unescape(encodeURIComponent(str)));
            } catch (e) {
                return '';
            }
        },
        'basic_string_field'
    );

    addBlock(
        'CB_from_base64',
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

    addBlock(
        'CB_string_split',
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

    addBlock(
        'CB_array_join',
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

    Entry.addEventListener('loadComplete', () => {
        Entry.block.CB_get_variable.func = (sprite, script) => {
            const name = script.getValue('VARNAME', script);
            const variable = Entry.variableContainer.getVariableByName(name);
            return variable ? String(variable.getValue()) : '';
        };

        Entry.block.CB_set_variable.func = (sprite, script) => {
            const name = script.getValue('VARNAME', script);
            const value = script.getValue('VALUE', script);
            let variable = Entry.variableContainer.getVariableByName(name);
            if (!variable) {
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

        Entry.block.CB_list_length.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            return list ? list.getArray().length : 0;
        };

        Entry.block.CB_list_item.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const index = Number(script.getValue('INDEX', script));
            const list = Entry.variableContainer.getListByName(name);
            if (!list) return '';
            const arr = list.getArray();
            const item = arr[index - 1];
            return item ? String(item.data) : '';
        };

        Entry.block.CB_list_add_item.func = (sprite, script) => {
            const value = script.getValue('VALUE', script);
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            if (list) {
                list.appendValue(value);
            }
        };

        Entry.block.CB_list_clear.func = (sprite, script) => {
            const name = script.getValue('LISTNAME', script);
            const list = Entry.variableContainer.getListByName(name);
            if (list) {
                while (list.getArray().length > 0) {
                    list.deleteValue(1);
                }
            }
        };

        Entry.block.CB_list_index_of.func = (sprite, script) => {
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
