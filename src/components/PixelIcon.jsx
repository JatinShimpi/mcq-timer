import * as Icons from '@nsmr/pixelart-react';

const NAME_MAPPING = {
    // Session/Practice
    'IconTarget': 'Bullseye',
    'IconDeviceFloppy': 'Save',
    'IconPlayerPlay': 'Play',
    'IconPlayerPause': 'Pause',
    'IconDragAndDrop': 'DragAndDrop',
    'IconBookOpen': 'BookOpen',
    'IconList': 'List',
    'IconTrash': 'Trash',
    'IconCalendar': 'Calendar',
    'IconClock': 'Clock',
    'IconClose': 'Close',
    'IconCheck': 'Check',
    'IconForward': 'Forward',
    'IconMoodHappy': 'MoodHappy',
    'IconReload': 'Reload',
    'IconArrowLeft': 'ArrowLeft',
    'IconArrowRight': 'ArrowRight',
    'IconArrowUp': 'ArrowUp',
    'IconArrowDown': 'ArrowDown',
    'IconChevronDown': 'ChevronDown',
    'IconChevronRight': 'ChevronRight',
    'IconCornerDownRight': 'CornerDownRight',
    'IconLogin': 'Login',
    'IconLogout': 'Logout',
    'IconSun': 'Sun',
    'IconMoon': 'Moon',
    'IconMenu': 'Menu',
    'IconHome': 'Home',
    'IconChartBar': 'ChartBar',
    'IconDownload': 'Download',
    'IconUpload': 'Upload',
    'IconPlus': 'Plus',
    'IconAlertTriangle': 'Alert',
    'IconZap': 'Zap',
    'IconCloud': 'Cloud',
    'IconFolder': 'Folder',
    'IconSearch': 'Search',

    // Specific mappings
    'IconBrandGithub': 'Github',
    'IconDeviceMobile': 'DevicePhone',
    'IconArtboard': 'Layout',
    'IconChartLine': 'TrendingUp',
    'IconSliders': 'Sliders',
    'IconHourglass': 'Hourglass',
    'IconSettings': 'Sliders',
    'IconArticle': 'Article',
};

export default function PixelIcon({ name, size = 24, className, ...props }) {
    // 1. Direct lookup
    let finalName = name;
    let IconComponent = Icons[name];

    // 2. Mapping lookup
    if (!IconComponent && NAME_MAPPING[name]) {
        finalName = NAME_MAPPING[name];
        IconComponent = Icons[finalName];
    }

    // 3. Strip 'Icon' prefix lookup
    if (!IconComponent && name.startsWith('Icon')) {
        const strippedName = name.substring(4);
        if (Icons[strippedName]) {
            finalName = strippedName;
            IconComponent = Icons[strippedName];
        }
    }

    if (!IconComponent) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`Icon "${name}" not found in @nsmr/pixelart-react (attempted "${finalName}")`);
        }
        return null;
    }

    return (
        <IconComponent
            style={{ width: size, height: size, minWidth: size, minHeight: size }}
            className={className}
            {...props}
        />
    );
}
