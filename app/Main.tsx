import {Link, Stack} from 'expo-router'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {useEffect, useState} from 'react'
import {useAccount, useLeague} from '@/hooks'
import {PermissionsAndroid, Platform} from 'react-native'
import i18n from '@/i18n'
import messaging from '@react-native-firebase/messaging'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {useThemeColor} from '@/hooks/useThemeColor'
import {useTranslation} from 'react-i18next'

export default function Main() {
  const [isMounted, setIsMounted] = useState(false)
  const [needsUpdate, setNeedsUpdate] = useState(false)

  const {t} = useTranslation()
  const textColor = useThemeColor({}, 'text')
  const league = useLeague()
  const account = useAccount()

  async function FetchUser() {
    try {
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  async function CheckVersion() {
    setNeedsUpdate(await account.CheckVersion())
  }

  useEffect(() => {
    FetchUser()
  }, [])

  useEffect(() => {
    league.GetSeason()
  }, [league])

  useEffect(() => {
    ;(async () => {
      try {
        const lang = await AsyncStorage.getItem('language')
        i18n.changeLanguage(lang ? lang : 'en')
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  async function RequestUserPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        messaging.AuthorizationStatus.PROVISIONAL
      if (enabled) {
        console.log('Authorization status: ', authStatus)
      }
    } else {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
    }
  }

  useEffect(() => {
    RequestUserPermission()
  }, [])

  async function CreateChannel() {
    await notifee.createChannel({
      id: 'App Wide',
      name: 'General',
      vibration: true,
      lights: true,
      importance: AndroidImportance.HIGH,
    })
  }

  useEffect(() => {
    CreateChannel()
  }, [])

  useEffect(() => {
    CheckVersion()
  }, [])

  if (isMounted) {
    return (
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            title: t('upcoming_matches'),
            headerTitleAlign: 'center',
            headerRight: () => (
              <Link href="/Settings">
                <MCI name="menu" color={textColor} size={30} />
              </Link>
            ),
          }}
        />
        <Stack.Screen
          name="Settings/index"
          options={{
            headerTitleAlign: 'center',
            title: t('bangkok_pool_league'),
          }}
        />
        <Stack.Screen
          name="Auth"
          options={{
            headerTitleAlign: 'center',
            title: t('login'),
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    )
  } else {
    return null
  }
}
