import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  useColorScheme,
  View,
  Image,
  ToastAndroid,
} from 'react-native';
import TrackPlayer, {Capability, State} from 'react-native-track-player';

import Icon from 'react-native-vector-icons/Feather';
// using tailwind for easy styling
import tailwind from 'tailwind-rn';

// we import array of songs
import {tracks} from './data/tracks';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  // Boolean to check if app is playing song
  const [isPlaying, setPlaying] = useState(false);
  // small state to store current song metadata.
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);

  // bootstrap the track player
  async function setUpTrackPlayer() {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add(tracks);
    } catch (e) {
      // error handling here could be better
      console.log('something went wrong');
    }
  }

  // checks if player is paused or playing and pauses or plays accordingly
  async function handlePlayOrPause() {
    const state = await TrackPlayer.getState();

    if (state === State.Playing) {
      await TrackPlayer.pause();
      setPlaying(false);
    }

    if (state === State.Paused) {
      await TrackPlayer.play();
      setPlaying(true);
    }
  }

  // run track player on mount
  useEffect(() => {
    TrackPlayer.updateOptions({
      stopWithApp: false,
      capabilities: [Capability.Play, Capability.Pause],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    setUpTrackPlayer();
    return () => TrackPlayer.destroy();
  }, []);

  // boolean that resolves to a icon depending on play condition
  const playOrPauseIcon = isPlaying ? 'pause-circle' : 'play-circle';

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={tailwind('pt-12 items-center')}>
        <Image
          source={{uri: selectedTrack.artwork}}
          style={tailwind('h-56 w-56 rounded-xl')}
        />
        <View style={tailwind('mt-5 my-6 flex flex-col items-center ')}>
          <Text style={tailwind('text-2xl my-3 font-bold text-black')}>
            {selectedTrack.name}
          </Text>
          <Text style={tailwind('text-lg')}>{selectedTrack.artist}</Text>
          <View style={tailwind('bg-blue-200 px-3 py-1 my-3 rounded-full')}>
            <Text style={tailwind('text-blue-800 font-semibold')}>
              {selectedTrack.genre}
            </Text>
          </View>
        </View>
        <View style={tailwind('flex flex-row items-center')}>
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.skipToPrevious();
              // we find current track
              const currentTrackId = selectedTrack.id;

              // we find previous item
              const previousTrack = tracks.find(
                track => track.id === (currentTrackId - 1) % tracks.lenth,
              );

              if (!previousTrack)
                return ToastAndroid.show('No more tracks', ToastAndroid.SHORT);
              setSelectedTrack(previousTrack);
            }}
            style={tailwind('rounded-full')}>
            <Icon name="skip-back" size={25} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayOrPause}
            style={tailwind('mx-10')}>
            <Icon name={playOrPauseIcon} size={45} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              TrackPlayer.skipToNext();
              const currentTrackId = selectedTrack.id;
              const nextTrack = tracks.find(
                track => track.id === (currentTrackId + 1) % tracks.length,
              );
              if (!nextTrack)
                return ToastAndroid.show('No more tracks', ToastAndroid.SHORT);
              setSelectedTrack(nextTrack);
            }}
            style={tailwind('rounded-full')}>
            <Icon name="skip-forward" size={25} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
