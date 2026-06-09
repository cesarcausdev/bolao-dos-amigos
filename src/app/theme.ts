export const theme = {
  colors: {
    background: '#07150D',

    primary: '#F2C230',
    primaryLight: '#FFD84D',
    primaryDark: '#B8860B',

    secondary: '#0E5A2D',
    secondaryDark: '#062F18',

    success: '#00D26A',

    text: '#FFFFFF',
    textSecondary: '#D6D6D6',

    border: '#1D4F2E',

    card: 'rgba(242, 194, 48, 0.10)',
    cardBorder: 'rgba(242, 194, 48, 0.22)',

    inputBg: 'rgba(255, 255, 255, 0.07)',
    inputBorder: '#1D4F2E',
    inputBorderFocus: '#F2C230',

    navBg: 'rgba(7, 21, 13, 0.95)',
    navBorder: 'rgba(242, 194, 48, 0.15)',

    danger: '#EF4444',
    dangerBg: 'rgba(239, 68, 68, 0.1)',
    dangerBorder: 'rgba(239, 68, 68, 0.2)',
  },

  // To change backgrounds: update these two paths
  backgrounds: {
    login: '/background-login.png',
    app: '/background-image.png',
  },

  // Gradient overlays applied on top of background images
  overlays: {
    login: 'linear-gradient(to bottom, rgba(7,21,13,0.35) 0%, rgba(7,21,13,0.70) 60%, rgba(7,21,13,0.97) 100%)',
    app: 'linear-gradient(to bottom, rgba(7,21,13,0.55) 0%, rgba(7,21,13,0.82) 100%)',
  },
} as const;

export type Theme = typeof theme;
