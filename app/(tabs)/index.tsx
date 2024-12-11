import React from 'react'
import {Button, FlatList, RefreshControl} from 'react-native'
import { ThemedView as View } from '@/components/ThemedView'
import { ThemedText as Text } from '@/components/ThemedText'
import MatchCard from '@/components/upcoming/MatchCard'
import {useLeague, useSeason} from '@/hooks'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import LiveScores from '@/components/upcoming/LiveScores'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useLeagueContext} from '@/context/LeagueContext'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@react-navigation/native'
import {Link, router} from 'expo-router'

interface ItemType {
  home_team_id: number,
  away_team_id: number,
  date: string
}
export default function UpcomingMatches(props: any) {
  const {colors} = useTheme()
  const {state, dispatch} = useLeagueContext()
  const [fixtures, setFixtures] = React.useState([])
  const user = state.user
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(true)
  const [showPostponed, setShowPostponed] = React.useState(false)
  const [seasonNumber, setSeasonNumber] = React.useState('')
  const season = useSeason()
  const league = useLeague()
  // const routeName = props.navigation.getState().routes[0].name
  const {t} = useTranslation()

  async function GetSeason() {
    try {
      const _season = await league.GetSeason()
      dispatch({type: 'SET_SEASON', payload: _season})
    } catch (e) {
      console.log(e)
    }
  }

  function HandlePress(idx: number) {
    router.push({pathname: '/Match', params: {matchInfo: fixtures[idx]}})
  }

  async function HandleScorePress(matchId: number) {
    try {
      const res = await league.GetMatchById(matchId)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        router.push({pathname: '/Match', params: {matchInfo: res.data}})
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function GetMatches(filtered = false, postponed = false) {
    try {
      setRefreshing(true)
      const query = []
      if (filtered) {
        query.push('noteam=false')
      } else {
        query.push('noteam=true')
      }
      if (postponed) {
        query.push('newonly=false')
      } else {
        query.push('newonly=true')
      }
      const res = await season.GetMatches(query)
      setFixtures(res)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    GetSeason()
  }, [])

  React.useEffect(() => {
    if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
      if (showMineOnly) {
        if (showPostponed) {
          GetMatches(true, true)
        } else {
          GetMatches(true, false)
        }
      } else {
        if (showPostponed) {
          GetMatches(false, true)
        } else {
          GetMatches(false, false)
        }
      }
    } else {
      GetMatches(false, false)
    }
  }, [showMineOnly, showPostponed, user])
  /*
  React.useEffect(() => {
    if (
      typeof user?.teams !== 'undefined' &&
      user.teams.length > 0 &&
      showMineOnly
    ) {
      GetMatches(true)
    } else {
      GetMatches(false)
    }
  }, [user])
  */

  async function HandleSavePostponedOption() {
    try {
      await AsyncStorage.setItem(
        'postponed',
        JSON.stringify({showPostponed: showPostponed}),
      )
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      HandleSavePostponedOption()
    }
  }, [showPostponed])
  async function HandleTogglePostponed() {
    setShowPostponed(s => !s)
  }

  async function HandleGetPostponedOption() {
    try {
      const res = await AsyncStorage.getItem('postponed')
      if (res) {
        const _res = JSON.parse(res)
        setShowPostponed(_res.showPostponed)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  React.useEffect(() => {
    HandleGetPostponedOption()
  }, [])

  if (isMounted) {
    return (
      <FlatList
        contentContainerStyle={{
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
                if (showMineOnly) {
                  if (showPostponed) {
                    GetMatches(true, true)
                  } else {
                    GetMatches(true, false)
                  }
                } else {
                  if (showPostponed) {
                    GetMatches(false, true)
                  } else {
                    GetMatches(false, false)
                  }
                }
              } else {
                GetMatches(false, false)
              }
            }}
          />
        }
        ListHeaderComponent={
          <>
            {!user.id && (
              <View className="my-4 mx-6">
                <Link href="/Auth" asChild><Button title={t('login_to_see_your_matches')} /></Link>
              </View>
            )}
            <LiveScores handlePress={HandleScorePress} />
            {(typeof user?.teams === 'undefined' || user.teams.length < 1) &&
              user.id && (
                <View className="my-4 mx=6">
                  <Text style={{textAlign: 'center'}}>
                    You are not affiliated with a team.
                  </Text>
                </View>
              )}
            {typeof user?.teams !== 'undefined' && user.teams.length > 0 && (
              <View className="mb-7 mx-10 mt-10 p-5">
                <BouncyCheckbox
                  text={t('show_mine_only')}
                  textStyle={{textDecorationLine: 'none'}}
                  isChecked={showMineOnly}
                  onPress={() => setShowMineOnly(s => !s)}
                />
                <View className="mt-6">
                  <BouncyCheckbox
                    text={t('show_postponed')}
                    textStyle={{textDecorationLine: 'none'}}
                    isChecked={showPostponed}
                    onPress={() => HandleTogglePostponed()}
                  />
                </View>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          isMounted && fixtures.length === 0 ? (
            <View className="my-14 mx-6 p-2">
              <Text className="text-center text-2xl">
                No upcoming matches for season: {state.season}
              </Text>
            </View>
          ) : null
        }
        keyExtractor={(item: ItemType, index) =>
          item.home_team_id + item.away_team_id + item.date + index
        }
        ItemSeparatorComponent={() => <View className="my-5" />}
        data={fixtures}
        renderItem={({item, index}) => (
          <MatchCard
            match={item}
            idx={index}
            handlePress={HandlePress}
            showMineOnly={showMineOnly}
          />
        )}
      />
    )
  } else {
    return null
  }
}