import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface OrderDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onAccept: (orderId: number) => void;
    order: any;
    details: any[];
}

export default function OrderDetailsModal({ visible, onClose, onAccept, order, details }: OrderDetailsModalProps) {
    if (!order) return null;

    const entrega = Array.isArray(order.entregas) && order.entregas.length > 0 ? order.entregas[0] : null;
    const lat = entrega?.latitud;
    const lon = entrega?.longitud;

    // HTML para OpenStreetMap con Leaflet
    const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>body, html, #map { height: 100%; margin: 0; padding: 0; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat || 0}, ${lon || 0}], 15);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);
          L.marker([${lat || 0}, ${lon || 0}]).addTo(map)
            .bindPopup('Ubicación de entrega')
            .openPopup();
        </script>
      </body>
    </html>
  `;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalles del Pedido #{order.id}</Text>
                    <Button title="Cerrar" onPress={onClose} color="red" />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Cliente ID:</Text>
                        <Text>{order.cliente_id}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Total:</Text>
                        <Text style={styles.price}>{order.total}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text>{new Date(order.fecha).toLocaleString()}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Productos:</Text>
                    {details.map((d, index) => (
                        <View key={index} style={styles.productRow}>
                            <Text style={styles.productName}>{d.cantidad}x {d.nombre_producto}</Text>
                            <Text>{d.subtotal}</Text>
                        </View>
                    ))}
                    {details.length === 0 && <Text>No se pudo cargar la lista de productos</Text>}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Ubicación de Entrega:</Text>
                    {lat && lon ? (
                        <View style={styles.mapContainer}>
                            {Platform.OS === 'web' ? (
                                // @ts-ignore
                                <iframe
                                    srcDoc={mapHtml}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            ) : (
                                <WebView
                                    originWhitelist={['*']}
                                    source={{ html: mapHtml }}
                                    style={{ flex: 1 }}
                                    scrollEnabled={false}
                                />
                            )}
                        </View>
                    ) : (
                        <Text style={{ fontStyle: 'italic', marginBottom: 20 }}>Sin ubicación registrada</Text>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                    <Button title="ACEPTAR PEDIDO" onPress={() => onAccept(order.id)} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginTop: 40, // SafeArea fix simple
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, padding: 16 },
    section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontWeight: '600' },
    price: { fontWeight: 'bold', color: 'green' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    productName: { flex: 1 },
    mapContainer: {
        height: 300,
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden'
    },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#ccc' },
});
