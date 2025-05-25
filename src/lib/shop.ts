export async function getShopsByGroupId(groupId: string) {
  // 仮の全データ
  const allShops = [
    {
      id: "1",
      name: "Sample Shop",
      image: null,
      genre: "イタリアン",
      url: "https://sample.com",
      address: "東京都○○区サンプル1-2-3",
      groupId: "dummy-group-1",
    },
    {
      id: "2",
      name: "Another Shop",
      image: null,
      genre: "和食",
      url: "https://sample2.com",
      address: "東京都△△区テスト4-5-6",
      groupId: "dummy-group-2",
    },
    // ...他のお店データ
  ];

  // groupIdでフィルタリング（今はサンプル）
  return allShops.filter((shop) => shop.groupId === groupId);
}
