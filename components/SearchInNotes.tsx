import {Text, TextInput, View} from 'react-native'

type SearchProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
}

const SearchInNotes = ({searchQuery, setSearchQuery}: SearchProps) => {
    return (
        <View className='mb-6'>
            <Text className='py-2 text-2xl font-bold px-2' >Search Note</Text>
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
              placeholder='Search for a note...'
                className='bg-gray-100 w-auto h-auto  border-2 border-gray-200 px-4 py-4 rounded-lg'
            />
        </View>
    )
}
export default SearchInNotes
