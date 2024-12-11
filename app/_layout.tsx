import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {useFonts} from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import {useEffect} from 'react'
import 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Appearance, ColorSchemeName} from 'react-native'
import {LeagueProvider} from '@/context/LeagueContext'
import {useColorScheme} from '@/hooks/useColorScheme'
import {useTranslation} from 'react-i18next'
import Main from '@/app/Main'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const {t} = useTranslation()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  useEffect(() => {
    ;(async () => {
      const savedColorScheme = await AsyncStorage.getItem('theme')
      if (!savedColorScheme) {
        Appearance.setColorScheme(null)
      } else {
        Appearance.setColorScheme(savedColorScheme as ColorSchemeName)
      }
    })()
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LeagueProvider>
        <Main />
      </LeagueProvider>
    </ThemeProvider>
  )
}
