# Xpeep - Decentralized Prediction Market 🔮

![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)
![MultiversX](https://img.shields.io/badge/Blockchain-MultiversX-black)
![React](https://img.shields.io/badge/Frontend-React-61dafb)

**Xpeep** is a high-stakes decentralized prediction market platform built on the [MultiversX](https://multiversx.com/) blockchain. Peep the future, bet on truth, and leverage sub-second finality for real-time predictions.

## 🚀 Overview

Xpeep revolutionizes how users interact with prediction markets by combining a sleek, cyberpunk-inspired interface with the robust security of the MultiversX blockchain. 

The frontend interacts with the Xpeep smart contract deployed on **Devnet**.

| Contract | Address |
|----------|---------|
| **Core** | `erd1qqqqqqqqqqqqqpgqlf7uyjfn8ajxzs3umc2cx7anneekr6ycdl7swcr83z` |

## ✨ Key Features

- **🤖 AI-Powered Analysis**: Leveraging Google Gemini AI to provide real-time market sentiment analysis and resolution assistance.
- **🔒 Fully On-Chain**: Transparent and secure markets where all bets and resolutions are executed via smart contracts.
- **🎨 Futuristic UI**: A high-fidelity, neon-themed interface designed for the next generation of web3 users.
- **⚡ Lightning Fast**: Built with Vite and MultiversX for sub-second interactions and updates.

## 🛠️ Technology Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain SDK**: [@multiversx/sdk-dapp](https://docs.multiversx.com/sdk-and-tools/sdk-dapp)
- **AI Integration**: [@google/generative-ai](https://ai.google.dev/)

## 📋 Requirements

- **Node.js**: version 18.0.0+ recommended (Minimum 16.20.0)
- **Package Manager**: Yarn or Npm

## 🏁 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/creativedev47/Xpeep.git
cd xpeep
yarn
```

### 2. Development

Start the application in development mode (connected to Devnet):

```bash
yarn start:devnet
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Production Build

Create an optimized build for deployment:

```bash
yarn build:devnet
```

## 📄 License

This project is licensed under the [GPL-3.0-or-later](LICENSE).
