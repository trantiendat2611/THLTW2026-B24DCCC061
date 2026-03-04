import { Card, InputNumber, Button, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

export default function BaiTap01() {
  const [randomNumber, setRandomNumber] = useState<number>(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(10);
  const [result, setResult] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const number = Math.floor(Math.random() * 100) + 1;
    setRandomNumber(number);
    setAttempts(10);
    setGuess(null);
    setResult('');
    setGameOver(false);
  };

  const handleGuess = () => {
    if (guess === null) {
      message.warning('Vui lòng nhập số!');
      return;
    }

    if (guess < randomNumber) {
      setResult('Bạn đoán quá thấp!');
    } else if (guess > randomNumber) {
      setResult('Bạn đoán quá cao!');
    } else {
      setResult('🎉 Chúc mừng! Bạn đã đoán đúng!');
      setGameOver(true);
      return;
    }

    const remain = attempts - 1;
    setAttempts(remain);

    if (remain === 0) {
      setResult(`❌ Bạn đã hết lượt! Số đúng là ${randomNumber}`);
      setGameOver(true);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <Title level={4}>🎯 Bài 1 – Trò chơi đoán số</Title>

      <InputNumber
        min={1}
        max={100}
        style={{ width: '100%', marginBottom: 16 }}
        value={guess}
        onChange={(value) => setGuess(value)}
        disabled={gameOver}
        placeholder="Nhập số từ 1 đến 100"
      />

      <Button type="primary" block onClick={handleGuess} disabled={gameOver}>
        Đoán
      </Button>

      <div style={{ marginTop: 16 }}>
        <Text>Số lượt còn lại: {attempts}</Text>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text>{result}</Text>
      </div>

      {gameOver && (
        <Button style={{ marginTop: 16 }} block onClick={resetGame}>
          Chơi lại
        </Button>
      )}
    </Card>
  );
}