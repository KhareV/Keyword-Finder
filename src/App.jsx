import { useState } from 'react';
import { Container, Box } from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import TextInput from './components/TextInput';
import KeywordsModal from './components/KeywordsModal';

const App = () => {
  const [keywords, setKeywords] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const extractKeywords = async (text) => {
    setLoading(true);
    setIsOpen(true);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or text-davinci-003 depending on your use case
        messages: [{ role: 'user', content: 'Extract keywords from this text. Make the first letter of every word uppercase and separate with commas:\n\n' + text }],
        temperature: 0.5,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.8,
        presence_penalty: 0.0,
      }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_OPENAI_API_URL, options);

      // Retry logic for 429 errors
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 1; // Retry after a default of 1 second if no Retry-After header is set
        console.log(`Rate limit hit, retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return extractKeywords(text); // Retry the request
      }

      const json = await response.json();
      console.log('Full response from API:', json);

      if (json.choices && json.choices.length > 0) {
        setKeywords(json.choices[0].text.trim());
      } else {
        console.error('No choices returned from API');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error during API call:', error);
      setLoading(false);
    }
  };




  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Box bg='blue.600' color='white' height='100vh' paddingTop={130}>
      <Container maxW='3xl' centerContent>
        <Header />
        <TextInput extractKeywords={extractKeywords} />
        <Footer />
      </Container>
      <KeywordsModal
        keywords={keywords}
        loading={loading}
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </Box>
  );
};

export default App;
