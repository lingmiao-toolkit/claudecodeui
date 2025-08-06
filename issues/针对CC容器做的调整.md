1、新增环境变量 CCUI_WORK_DIR， 如果这值被设置了
- 那么系统启动时默认会进入这个目录，即在左侧的项目列表中选中这个项目
- 如果目标目录不存在，那么系统会自动创建

2、新增环境变量 CCUI_DEFAULT_SHELL，默认为 false
- 如果这个值被设置为 true，那么系统会自动切换到 Shell 标签页
- 同时连接当前选中项目，并将claude的模式设置为bypass permissions

3、新新环境变量 CCUI_SINGLE_PROJECT，默认为 false
- 如果这个值被设置为 true，那么新建工程按钮将被禁用