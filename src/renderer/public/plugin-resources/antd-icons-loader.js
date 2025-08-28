// AntDesign Icons 全量导入加载器
// AntDesign Icons 全量导入加载器
// 为插件提供完整的图标库支持

(function() {
  // 常用图标列表 - 这里列出了大部分常用的AntDesign图标
  const iconNames = [
    'StepBackwardOutlined', 'StepForwardOutlined', 'FastBackwardOutlined', 'FastForwardOutlined',
    'ShrinkOutlined', 'ArrowsAltOutlined', 'DownOutlined', 'UpOutlined', 'LeftOutlined', 'RightOutlined',
    'CaretUpOutlined', 'CaretDownOutlined', 'CaretLeftOutlined', 'CaretRightOutlined',
    'UpCircleOutlined', 'DownCircleOutlined', 'LeftCircleOutlined', 'RightCircleOutlined',
    'DoubleRightOutlined', 'DoubleLeftOutlined', 'VerticalRightOutlined', 'VerticalLeftOutlined',
    'VerticalAlignTopOutlined', 'VerticalAlignMiddleOutlined', 'VerticalAlignBottomOutlined',
    'ForwardOutlined', 'BackwardOutlined', 'RollbackOutlined', 'EnterOutlined', 'RetweetOutlined',
    'SwapOutlined', 'SwapLeftOutlined', 'SwapRightOutlined', 'ArrowUpOutlined', 'ArrowDownOutlined',
    'ArrowLeftOutlined', 'ArrowRightOutlined', 'PlayCircleOutlined', 'UpSquareOutlined',
    'DownSquareOutlined', 'LeftSquareOutlined', 'RightSquareOutlined', 'LoginOutlined', 'LogoutOutlined',
    'MenuFoldOutlined', 'MenuUnfoldOutlined', 'BorderBottomOutlined', 'BorderHorizontalOutlined',
    'BorderInnerOutlined', 'BorderOuterOutlined', 'BorderLeftOutlined', 'BorderRightOutlined',
    'BorderTopOutlined', 'BorderVerticleOutlined', 'PicCenterOutlined', 'PicLeftOutlined',
    'PicRightOutlined', 'RadiusBottomleftOutlined', 'RadiusBottomrightOutlined', 'RadiusUpleftOutlined',
    'RadiusUprightOutlined', 'FullscreenOutlined', 'FullscreenExitOutlined', 'QuestionOutlined',
    'QuestionCircleOutlined', 'PlusOutlined', 'PlusCircleOutlined', 'PauseOutlined', 'PauseCircleOutlined',
    'MinusOutlined', 'MinusCircleOutlined', 'PlusSquareOutlined', 'MinusSquareOutlined',
    'InfoOutlined', 'InfoCircleOutlined', 'ExclamationOutlined', 'ExclamationCircleOutlined',
    'CloseOutlined', 'CloseCircleOutlined', 'CloseSquareOutlined', 'CheckOutlined', 'CheckCircleOutlined',
    'CheckSquareOutlined', 'ClockCircleOutlined', 'WarningOutlined', 'IssuesCloseOutlined',
    'StopOutlined', 'EditOutlined', 'FormOutlined', 'CopyOutlined', 'ScissorOutlined', 'DeleteOutlined',
    'SnippetsOutlined', 'DiffOutlined', 'HighlightOutlined', 'AlignCenterOutlined', 'AlignLeftOutlined',
    'AlignRightOutlined', 'BgColorsOutlined', 'BoldOutlined', 'ItalicOutlined', 'UnderlineOutlined',
    'StrikethroughOutlined', 'RedoOutlined', 'UndoOutlined', 'ZoomInOutlined', 'ZoomOutOutlined',
    'FontColorsOutlined', 'FontSizeOutlined', 'LineHeightOutlined', 'DashOutlined', 'SmallDashOutlined',
    'SortAscendingOutlined', 'SortDescendingOutlined', 'DragOutlined', 'OrderedListOutlined',
    'UnorderedListOutlined', 'RadiusSettingOutlined', 'ColumnWidthOutlined', 'ColumnHeightOutlined',
    'AreaChartOutlined', 'PieChartOutlined', 'BarChartOutlined', 'DotChartOutlined', 'LineChartOutlined',
    'RadarChartOutlined', 'HeatMapOutlined', 'FallOutlined', 'RiseOutlined', 'StockOutlined',
    'BoxPlotOutlined', 'FundOutlined', 'SlidersOutlined', 'AndroidOutlined', 'AppleOutlined',
    'WindowsOutlined', 'IeOutlined', 'ChromeOutlined', 'GithubOutlined', 'AliwangwangOutlined',
    'DingdingOutlined', 'WeiboSquareOutlined', 'WeiboCircleOutlined', 'TaobaoCircleOutlined',
    'Html5Outlined', 'WeiboOutlined', 'TwitterOutlined', 'WechatOutlined', 'YoutubeOutlined',
    'AlipayCircleOutlined', 'TaobaoOutlined', 'SkypeOutlined', 'QqOutlined', 'MediumWorkmarkOutlined',
    'GitlabOutlined', 'MediumOutlined', 'LinkedinOutlined', 'GooglePlusOutlined', 'DropboxOutlined',
    'FacebookOutlined', 'CodepenOutlined', 'CodeSandboxOutlined', 'AmazonOutlined', 'GoogleOutlined',
    'CodepenCircleOutlined', 'AlipayOutlined', 'AntDesignOutlined', 'AntCloudOutlined', 'AliyunOutlined',
    'ZhihuOutlined', 'SlackOutlined', 'SlackSquareOutlined', 'BehanceOutlined', 'BehanceSquareOutlined',
    'DribbbleOutlined', 'DribbbleSquareOutlined', 'InstagramOutlined', 'YuqueOutlined', 'AlibabaOutlined',
    'YahooOutlined', 'RedditOutlined', 'SketchOutlined', 'AccountBookOutlined', 'AimOutlined',
    'AlertOutlined', 'ApartmentOutlined', 'ApiOutlined', 'AppstoreAddOutlined', 'AppstoreOutlined',
    'AudioOutlined', 'AudioMutedOutlined', 'AuditOutlined', 'BankOutlined', 'BarcodeOutlined',
    'BarsOutlined', 'BellOutlined', 'BlockOutlined', 'BookOutlined', 'BorderOutlined', 'BranchesOutlined',
    'BugOutlined', 'BuildOutlined', 'BulbOutlined', 'CalculatorOutlined', 'CalendarOutlined',
    'CameraOutlined', 'CarOutlined', 'CarryOutOutlined', 'CiCircleOutlined', 'CiOutlined',
    'CloudOutlined', 'CloudDownloadOutlined', 'CloudServerOutlined', 'CloudSyncOutlined',
    'CloudUploadOutlined', 'ClusterOutlined', 'CodeOutlined', 'CoffeeOutlined', 'CompassOutlined',
    'CompressOutlined', 'ConsoleSqlOutlined', 'ContactsOutlined', 'ContainerOutlined', 'ControlOutlined',
    'CopyrightCircleOutlined', 'CopyrightOutlined', 'CreditCardOutlined', 'CrownOutlined',
    'CustomerServiceOutlined', 'DashboardOutlined', 'DatabaseOutlined', 'DeleteColumnOutlined',
    'DeleteRowOutlined', 'DeliveredProcedureOutlined', 'DeploymentUnitOutlined', 'DesktopOutlined',
    'DisconnectOutlined', 'DislikeOutlined', 'DollarCircleOutlined', 'DollarOutlined', 'DownloadOutlined',
    'EllipsisOutlined', 'EnvironmentOutlined', 'EuroCircleOutlined', 'EuroOutlined', 'ExceptionOutlined',
    'ExpandAltOutlined', 'ExpandOutlined', 'ExperimentOutlined', 'ExportOutlined', 'EyeOutlined',
    'EyeInvisibleOutlined', 'FieldBinaryOutlined', 'FieldNumberOutlined', 'FieldStringOutlined',
    'FieldTimeOutlined', 'FileAddOutlined', 'FileDoneOutlined', 'FileExcelOutlined', 'FileExclamationOutlined',
    'FileImageOutlined', 'FileJpgOutlined', 'FileMarkdownOutlined', 'FileOutlined', 'FilePdfOutlined',
    'FilePptOutlined', 'FileProtectOutlined', 'FileSearchOutlined', 'FileSyncOutlined', 'FileTextOutlined',
    'FileUnknownOutlined', 'FileWordOutlined', 'FileZipOutlined', 'FilterOutlined', 'FireOutlined',
    'FlagOutlined', 'FolderAddOutlined', 'FolderOutlined', 'FolderOpenOutlined', 'FolderViewOutlined',
    'ForkOutlined', 'FormatPainterOutlined', 'FrownOutlined', 'FunctionOutlined', 'FunnelPlotOutlined',
    'GatewayOutlined', 'GifOutlined', 'GiftOutlined', 'GlobalOutlined', 'GoldOutlined', 'GroupOutlined',
    'HddOutlined', 'HeartOutlined', 'HistoryOutlined', 'HomeOutlined', 'HourglassOutlined', 'IdcardOutlined',
    'ImportOutlined', 'InboxOutlined', 'InsertRowAboveOutlined', 'InsertRowBelowOutlined',
    'InsertRowLeftOutlined', 'InsertRowRightOutlined', 'InsuranceOutlined', 'InteractionOutlined',
    'KeyOutlined', 'LaptopOutlined', 'LayoutOutlined', 'LikeOutlined', 'LineOutlined', 'LinkOutlined',
    'Loading3QuartersOutlined', 'LoadingOutlined', 'LockOutlined', 'MailOutlined', 'ManOutlined',
    'MedicineBoxOutlined', 'MehOutlined', 'MenuOutlined', 'MergeOutlined', 'MessageOutlined',
    'MobileOutlined', 'MoneyCollectOutlined', 'MonitorOutlined', 'MoreOutlined', 'NodeCollapseOutlined',
    'NodeExpandOutlined', 'NodeIndexOutlined', 'NotificationOutlined', 'NumberOutlined', 'PaperClipOutlined',
    'PartitionOutlined', 'PayCircleOutlined', 'PercentageOutlined', 'PhoneOutlined', 'PictureOutlined',
    'PlaySquareOutlined', 'PoundCircleOutlined', 'PoundOutlined', 'PoweroffOutlined', 'PrinterOutlined',
    'ProfileOutlined', 'ProjectOutlined', 'PropertySafetyOutlined', 'PullRequestOutlined', 'PushpinOutlined',
    'QrcodeOutlined', 'ReadOutlined', 'ReconciliationOutlined', 'RedEnvelopeOutlined', 'ReloadOutlined',
    'RestOutlined', 'RobotOutlined', 'RocketOutlined', 'SafetyCertificateOutlined', 'SafetyOutlined',
    'ScanOutlined', 'ScheduleOutlined', 'SearchOutlined', 'SecurityScanOutlined', 'SelectOutlined',
    'SendOutlined', 'SettingOutlined', 'ShakeOutlined', 'ShareAltOutlined', 'ShopOutlined',
    'ShoppingCartOutlined', 'ShoppingOutlined', 'SisternodeOutlined', 'SkinOutlined', 'SmileOutlined',
    'SolutionOutlined', 'SoundOutlined', 'SplitCellsOutlined', 'StarOutlined', 'SubnodeOutlined',
    'SyncOutlined', 'TableOutlined', 'TabletOutlined', 'TagOutlined', 'TagsOutlined', 'TeamOutlined',
    'ThunderboltOutlined', 'ToTopOutlined', 'ToolOutlined', 'TrademarkCircleOutlined', 'TrademarkOutlined',
    'TransactionOutlined', 'TrophyOutlined', 'UngroupOutlined', 'UnlockOutlined', 'UploadOutlined',
    'UsbOutlined', 'UserAddOutlined', 'UserDeleteOutlined', 'UserOutlined', 'UserSwitchOutlined',
    'UsergroupAddOutlined', 'UsergroupDeleteOutlined', 'VideoCameraOutlined', 'WalletOutlined',
    'WifiOutlined', 'BorderlessTableOutlined', 'WomanOutlined', 'BehanceSquareFilled', 'CodeSandboxSquareFilled',
    'DribbbleSquareFilled', 'DropboxSquareFilled', 'FacebookFilled', 'GoogleSquareFilled', 'InstagramFilled',
    'PieChartFilled', 'PlaySquareFilled', 'LinkedinFilled', 'GithubFilled', 'CaretDownFilled',
    'CaretLeftFilled', 'CaretRightFilled', 'CaretUpFilled', 'CheckCircleFilled', 'CheckSquareFilled',
    'CloseCircleFilled', 'CloseSquareFilled', 'CodeFilled', 'CompassFilled', 'CopyFilled',
    'CopyrightCircleFilled', 'CrownFilled', 'CustomerServiceFilled', 'DiffFilled', 'DislikeFilled',
    'DollarCircleFilled', 'DownCircleFilled', 'DownSquareFilled', 'EnvironmentFilled', 'EuroCircleFilled',
    'ExclamationCircleFilled', 'ExperimentFilled', 'EyeFilled', 'EyeInvisibleFilled', 'FileAddFilled',
    'FileExcelFilled', 'FileExclamationFilled', 'FileImageFilled', 'FileMarkdownFilled', 'FilePdfFilled',
    'FilePptFilled', 'FileTextFilled', 'FileUnknownFilled', 'FileWordFilled', 'FileZipFilled',
    'FilterFilled', 'FireFilled', 'FlagFilled', 'FolderAddFilled', 'FolderFilled', 'FolderOpenFilled',
    'FormatPainterFilled', 'FrownFilled', 'FunnelPlotFilled', 'GiftFilled', 'GoldFilled',
    'HeartFilled', 'HighlightFilled', 'HomeFilled', 'HourglassFilled', 'Html5TwoTone', 'IdcardFilled',
    'IeSquareFilled', 'InfoCircleFilled', 'InsuranceFilled', 'InteractionFilled', 'LayoutFilled',
    'LeftCircleFilled', 'LeftSquareFilled', 'LikeFilled', 'LockFilled', 'MailFilled', 'MedicineBoxFilled',
    'MehFilled', 'MessageFilled', 'MinusCircleFilled', 'MinusSquareFilled', 'MobileFilled',
    'MoneyCollectFilled', 'NotificationFilled', 'PauseCircleFilled', 'PhoneFilled', 'PictureFilled',
    'PieChartTwoTone', 'PlayCircleFilled', 'PlusCircleFilled', 'PlusSquareFilled', 'PoundCircleFilled',
    'PrinterFilled', 'ProfileFilled', 'ProjectFilled', 'PropertySafetyFilled', 'PushpinFilled',
    'QqSquareFilled', 'ReadFilled', 'ReconciliationFilled', 'RedEnvelopeFilled', 'RestFilled',
    'RightCircleFilled', 'RightSquareFilled', 'SafetyCertificateFilled', 'SaveFilled', 'ScheduleFilled',
    'SecurityScanFilled', 'SettingFilled', 'ShopFilled', 'ShoppingFilled', 'SignalFilled',
    'SketchSquareFilled', 'SkinFilled', 'SmileFilled', 'SoundFilled', 'StarFilled', 'SwitcherFilled',
    'TabletFilled', 'TagFilled', 'TagsFilled', 'ThunderboltFilled', 'ToolFilled', 'TrademarkCircleFilled',
    'TrophyFilled', 'TwitterSquareFilled', 'UnlockFilled', 'UpCircleFilled', 'UpSquareFilled',
    'UsbFilled', 'VideoCameraFilled', 'WalletFilled', 'WarningFilled', 'WeiboSquareFilled'
  ];

  // 创建图标组件工厂
  function createIconComponent(iconName) {
    return function AntdIcon(props = {}) {
      const { 
        style = {}, 
        className = '', 
        onClick,
        size = '1em',
        color = 'currentColor',
        ...restProps 
      } = props;
      
      const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        color: color,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      };
      
      // 如果在React环境中
      if (typeof React !== 'undefined') {
        return React.createElement(
          'span',
          {
            className: `anticon anticon-${iconName.toLowerCase().replace(/outlined|filled|twotone/g, '')} ${className}`,
            style: iconStyle,
            onClick: onClick,
            ...restProps
          },
          // 使用Unicode字符或简单文本表示图标
          getIconSymbol(iconName)
        );
      }
      
      // 在普通HTML环境中返回HTML字符串
      return `<span class="anticon anticon-${iconName.toLowerCase().replace(/outlined|filled|twotone/g, '')} ${className}" style="${Object.entries(iconStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}">${getIconSymbol(iconName)}</span>`;
    };
  }
  
  // 获取图标符号
  function getIconSymbol(iconName) {
    // 这里可以根据图标名称返回对应的Unicode字符或SVG
    const iconMap = {
      'HomeOutlined': '🏠',
      'UserOutlined': '👤',
      'SettingOutlined': '⚙️',
      'SearchOutlined': '🔍',
      'PlusOutlined': '➕',
      'MinusOutlined': '➖',
      'CloseOutlined': '✖️',
      'CheckOutlined': '✅',
      'EditOutlined': '✏️',
      'DeleteOutlined': '🗑️',
      'DownloadOutlined': '⬇️',
      'UploadOutlined': '⬆️',
      'LeftOutlined': '⬅️',
      'RightOutlined': '➡️',
      'UpOutlined': '⬆️',
      'DownOutlined': '⬇️',
      'ReloadOutlined': '🔄',
      'LoadingOutlined': '⏳',
      'HeartOutlined': '❤️',
      'StarOutlined': '⭐',
      'LikeOutlined': '👍',
      'DislikeOutlined': '👎',
      'EyeOutlined': '👁️',
      'EyeInvisibleOutlined': '🙈',
      'LockOutlined': '🔒',
      'UnlockOutlined': '🔓',
      'MailOutlined': '📧',
      'PhoneOutlined': '📞',
      'CalendarOutlined': '📅',
      'ClockCircleOutlined': '🕐',
      'BellOutlined': '🔔',
      'NotificationOutlined': '📢',
      'MessageOutlined': '💬',
      'FileOutlined': '📄',
      'FolderOutlined': '📁',
      'FolderOpenOutlined': '📂',
      'PictureOutlined': '🖼️',
      'CameraOutlined': '📷',
      'VideoCameraOutlined': '📹',
      'MobileOutlined': '📱',
      'TabletOutlined': '📱',
      'LaptopOutlined': '💻',
      'DesktopOutlined': '🖥️',
      'PrinterOutlined': '🖨️',
      'WifiOutlined': '📶',
      'GlobalOutlined': '🌐',
      'LinkOutlined': '🔗',
      'ShareAltOutlined': '📤',
      'QrcodeOutlined': '📱',
      'BarcodeOutlined': '📊',
      'CalculatorOutlined': '🧮',
      'BankOutlined': '🏦',
      'ShopOutlined': '🏪',
      'ShoppingOutlined': '🛒',
      'CarOutlined': '🚗',
      'RocketOutlined': '🚀',
      'BugOutlined': '🐛',
      'ToolOutlined': '🔧',
      'BuildOutlined': '🔨',
      'SafetyOutlined': '🛡️',
      'CrownOutlined': '👑',
      'TrophyOutlined': '🏆',
      'GiftOutlined': '🎁',
      'FireOutlined': '🔥',
      'ThunderboltOutlined': '⚡',
      'BulbOutlined': '💡',
      'ExperimentOutlined': '🧪',
      'DatabaseOutlined': '🗄️',
      'CloudOutlined': '☁️',
      'SunOutlined': '☀️',
      'MoonOutlined': '🌙',
      'EnvironmentOutlined': '📍',
      'CompassOutlined': '🧭',
      'TeamOutlined': '👥',
      'UsergroupAddOutlined': '👥➕',
      'CustomerServiceOutlined': '🎧',
      'RobotOutlined': '🤖',
      'SmileOutlined': '😊',
      'MehOutlined': '😐',
      'FrownOutlined': '☹️'
    };
    
    return iconMap[iconName] || iconName.replace(/([A-Z])/g, ' $1').trim();
  }
  
  // 创建图标代理对象
  const AntdIcons = {};
  iconNames.forEach(iconName => {
    AntdIcons[iconName] = createIconComponent(iconName);
  });
  
  // 将图标库挂载到全局对象
  window.AntdIcons = AntdIcons;
  
  // 提供图标获取函数
  window.getAntdIcon = function(iconName) {
    return AntdIcons[iconName] || createIconComponent(iconName);
  };
  
  // 提供图标列表
  window.getAntdIconList = function() {
    return iconNames;
  };
  
  // 创建图标元素的辅助函数
  window.createAntdIcon = function(iconName, props = {}) {
    const IconComponent = window.getAntdIcon(iconName);
    if (!IconComponent) {
      console.warn(`Icon ${iconName} not found`);
      return null;
    }
    
    // 如果在React环境中
    if (typeof React !== 'undefined') {
      return React.createElement(IconComponent, props);
    }
    
    // 如果在普通HTML环境中，调用组件函数获取HTML字符串
    return IconComponent(props);
  };
  
  // 检查图标是否存在
  window.hasAntdIcon = function(iconName) {
    return iconNames.includes(iconName);
  };
  
  console.log('AntDesign Icons loaded:', iconNames.length, 'icons available');
  
  // 触发图标加载完成事件
  const event = new CustomEvent('antd-icons-loaded', { 
    detail: { 
      iconNames: iconNames,
      count: iconNames.length 
    } 
  });
  document.dispatchEvent(event);
})();
