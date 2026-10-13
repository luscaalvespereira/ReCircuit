/* ReCircuit — Solana Devnet layer (Phantom or in-browser demo wallet, Memo program anchors) */
(function () {
  const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
  const RPC = 'https://api.devnet.solana.com';
  const KEY = 'rc_burner_sk_v1';
  const sw = () => window.solanaWeb3;

  const Sol = {
    mode: null,            // 'phantom' | 'demo' | null
    publicKey: null,       // PublicKey
    keypair: null,         // demo wallet keypair
    provider: null,        // phantom provider
    conn: null,

    available() { return !!sw(); },
    connection() { if (!this.conn) this.conn = new (sw().Connection)(RPC, 'confirmed'); return this.conn; },
    phantom() { return (window.phantom && window.phantom.solana) || (window.solana && window.solana.isPhantom ? window.solana : null); },
    short(pk) { const s = (pk || this.publicKey || '').toString(); return s ? s.slice(0, 4) + '…' + s.slice(-4) : ''; },
    explorer(sig) { return 'https://explorer.solana.com/tx/' + sig + '?cluster=devnet'; },
    explorerAddr(a) { return 'https://explorer.solana.com/address/' + a + '?cluster=devnet'; },

    async connectPhantom() {
      const p = this.phantom();
      if (!p) throw new Error('Phantom not detected. Use the demo wallet or install Phantom.');
      const r = await p.connect();
      this.provider = p; this.mode = 'phantom'; this.keypair = null;
      this.publicKey = r.publicKey || p.publicKey;
      return this.publicKey;
    },

    connectDemo() {
      const { Keypair } = sw();
      let kp;
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (saved) kp = Keypair.fromSecretKey(Uint8Array.from(saved));
      } catch (e) { /* ignore */ }
      if (!kp) { kp = Keypair.generate(); localStorage.setItem(KEY, JSON.stringify(Array.from(kp.secretKey))); }
      this.keypair = kp; this.mode = 'demo'; this.provider = null; this.publicKey = kp.publicKey;
      return this.publicKey;
    },

    async disconnect() {
      try { if (this.mode === 'phantom' && this.provider && this.provider.disconnect) await this.provider.disconnect(); } catch (e) { /* ignore */ }
      this.mode = null; this.publicKey = null; this.keypair = null; this.provider = null;
    },

    async balance() {
      if (!this.publicKey) return 0;
      return (await this.connection().getBalance(this.publicKey)) / sw().LAMPORTS_PER_SOL;
    },

    async airdrop(sol = 1) {
      const c = this.connection();
      const sig = await c.requestAirdrop(this.publicKey, sol * sw().LAMPORTS_PER_SOL);
      const bh = await c.getLatestBlockhash();
      await c.confirmTransaction({ signature: sig, ...bh }, 'confirmed');
      return sig;
    },

    /** Writes a text memo to Solana Devnet. Returns the transaction signature. */
    async anchor(text) {
      if (!this.publicKey) throw new Error('Connect a wallet first.');
      const { Transaction, TransactionInstruction, PublicKey } = sw();
      const c = this.connection();
      const bal = await c.getBalance(this.publicKey);
      if (bal < 10000) {
        if (this.mode === 'demo') { try { await this.airdrop(1); } catch (e) { throw new Error('NEEDS_FUNDS'); } }
        else throw new Error('NEEDS_FUNDS');
      }
      const ix = new TransactionInstruction({
        keys: [{ pubkey: this.publicKey, isSigner: true, isWritable: true }],
        programId: new PublicKey(MEMO_PROGRAM),
        data: new TextEncoder().encode(text)
      });
      const tx = new Transaction().add(ix);
      const bh = await c.getLatestBlockhash();
      tx.feePayer = this.publicKey; tx.recentBlockhash = bh.blockhash;
      let signature;
      if (this.mode === 'phantom') {
        const r = await this.provider.signAndSendTransaction(tx);
        signature = r.signature || r;
      } else {
        tx.sign(this.keypair);
        signature = await c.sendRawTransaction(tx.serialize());
      }
      await c.confirmTransaction({ signature, ...bh }, 'confirmed');
      return signature;
    }
  };
  window.RCSol = Sol;
})();
