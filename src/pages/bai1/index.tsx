import { Card, Button, Typography, List } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;

type Choice = 'Kéo' | 'Búa' | 'Bao';

interface HistoryItem {
  player: Choice;
  computer: Choice;
  result: string;
}

const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];

export default function BaiTap01() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<string>('');

  const getResult = (player: Choice, computer: Choice) => {
    if (player === computer) return 'Hòa';

    if (
      (player === 'Kéo' && computer === 'Bao') ||
      (player === 'Bao' && computer === 'Búa') ||
      (player === 'Búa' && computer === 'Kéo')
    ) {
      return 'Thắng';
    }

    return 'Thua';
  };

  const playGame = (playerChoice: Choice) => {
    const computerChoice =
      choices[Math.floor(Math.random() * choices.length)];

    const gameResult = getResult(playerChoice, computerChoice);

    setResult(
      `Bạn chọn ${playerChoice} | Máy chọn ${computerChoice} → ${gameResult}`
    );

    const newHistory: HistoryItem = {
      player: playerChoice,
      computer: computerChoice,
      result: gameResult,
    };

    setHistory([newHistory, ...history]);
  };

  return (
    <Card style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
      <Title level={4}>🎮 Bài 1 – Trò chơi Oẳn Tù Tì</Title>

      <div style={{ marginBottom: 20 }}>
        <Button
          type="primary"
          onClick={() => playGame('Kéo')}
          style={{ marginRight: 10 }}
        >
          Kéo
        </Button>

        <Button
          type="primary"
          onClick={() => playGame('Búa')}
          style={{ marginRight: 10 }}
        >
          Búa
        </Button>

        <Button type="primary" onClick={() => playGame('Bao')}>
          Bao
        </Button>
      </div>

      <Text strong>{result}</Text>

      <Title level={5} style={{ marginTop: 20 }}>
        Lịch sử ván đấu
      </Title>

      <List
        bordered
        dataSource={history}
        renderItem={(item, index) => (
          <List.Item>
            Ván {history.length - index}: Bạn {item.player} | Máy {item.computer} → {item.result}
          </List.Item>
        )}
      />
    </Card>
  );
}