import React from 'react'
import {Button, Image, Pressable} from 'react-native'
import { ThemedView as View } from '@/components/ThemedView'
import { ThemedText as Text } from '@/components/ThemedText'
import {DateTime} from 'luxon'
import {showLocation} from 'react-native-map-link'
import { useTranslation } from 'react-i18next'

export default function MatchCard(props) {
  const {t} = useTranslation()

  function ShowLocation(lat, long) {
    showLocation({
      latitude: lat,
      longitude: long,
    })
  }

  return (
    <View
      style={{
        margin: 10,
        padding: 10,
        borderRadius: 10,
      }}>
      <Pressable onPress={() => props.handlePress(props.idx)}>
        <View>
          <Text>{props.match.round}</Text>
          <Text variant="headlineSmall" style={{textAlign: 'center'}}>
            {props.match.home_team_short_name} vs{' '}
            {props.match.away_team_short_name}
          </Text>
          <Text variant="titleMedium" style={{textAlign: 'center'}}>
            {DateTime.fromISO(props.match.date).toLocaleString(
              DateTime.DATE_HUGE,
            )}
          </Text>
          <Text>Match ID: {props.match.match_id}</Text>
          <Text>Where:</Text>
          <Text>{props.match.name}</Text>
          <Text>{props.match.location}</Text>
          <Text>{props.match.phone}</Text>
          {(props.match.latitude !== 0 || props.match.longitude !== 0) && (
            <View style={{flexDirection: 'row'}}>
              <Button
                title={t('map')}
                onPress={() =>
                  ShowLocation(props.match.latitude, props.match.longitude)
                } />
            </View>
          )}
          {props.match.logo && (
            <View
              style={{position: 'absolute', bottom: 0, right: 10, zIndex: -1}}>
              <Image
                source={{uri: props.match.logo}}
                width={100}
                height={150}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  )
}
