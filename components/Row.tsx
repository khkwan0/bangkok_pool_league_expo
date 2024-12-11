import React from 'react'
import {ThemedView as View} from './ThemedView'

export default function Row(props: any) {
  const classStr = "flex-row"
  return (
    <View className={classStr}>
      {...props.children}
    </View>
  )
}