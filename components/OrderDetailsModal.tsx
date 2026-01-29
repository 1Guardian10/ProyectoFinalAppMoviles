import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    background: '#F8FAFC',
    card: '#FFFFFF',
    textDark: '#0F172A',
    textGray: '#6B7280',
    border: '#E5E7EB',
    success: '#22C55E',
    danger: '#EF4444',
};

interface OrderDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onAccept: (orderId: number) => void;
    order: any;
    details: any[];
}

export default function OrderDetailsModal({
    visible,
    onClose,
    onAccept,
    order,
    details,
}: OrderDetailsModalProps) {
    if (!order) return null;

    const entrega =
        Array.isArray(order.entregas) && order.entregas.length > 0
            ? order.entregas[0]
            : null;

    const lat = entrega?.latitud;
    const lon = entrega?.longitud;

    const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html, body, #map { height: 100%; margin: 0; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map').setView([${lat || 0}, ${lon || 0}], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([${lat || 0}, ${lon || 0}]).addTo(map).bindPopup("Entrega").openPopup();
</script>
</body>
</html>
`;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            Pedido #{order.id}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* INFO GENERAL */}
                        <View style={styles.card}>
                            <InfoRow label="Cliente" value={order.cliente_id} />
                            <InfoRow
                                label="Fecha"
                                value={new Date(order.fecha).toLocaleString()}
                            />
                            <InfoRow
                                label="Total"
                                value={`Bs. ${order.total}`}
                                highlight
                            />
                        </View>

                        {/* PRODUCTOS */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>🛒 Productos</Text>
                            {details.map((d, i) => (
                                <View key={i} style={styles.productRow}>
                                    <Text style={styles.productName}>
                                        {d.cantidad} × {d.nombre_producto}
                                    </Text>
                                    <Text style={styles.productPrice}>
                                        Bs. {d.subtotal}
                                    </Text>
                                </View>
                            ))}
                            {details.length === 0 && (
                                <Text style={styles.empty}>No hay productos registrados</Text>
                            )}
                        </View>

                        {/* MAPA */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>📍 Ubicación de entrega</Text>
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
                                        />
                                    )}
                                </View>
                            ) : (
                                <Text style={styles.empty}>Sin ubicación registrada</Text>
                            )}
                        </View>
                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => onAccept(order.id)}
                        >
                            <Text style={styles.acceptText}>✔ ACEPTAR PEDIDO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* COMPONENTE INFO */
function InfoRow({ label, value, highlight = false }: any) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text
                style={[
                    styles.infoValue,
                    highlight && { color: COLORS.success, fontSize: 16 },
                ]}
            >
                {value}
            </Text>
        </View>
    );
}

/* ESTILOS */

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: width * 0.95,
        height: '92%',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    close: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        padding: 14,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        color: COLORS.textDark,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    infoLabel: {
        color: COLORS.textGray,
    },
    infoValue: {
        color: COLORS.textDark,
        fontWeight: '600',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    productName: {
        color: COLORS.textDark,
        flex: 1,
    },
    productPrice: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    empty: {
        color: COLORS.textGray,
        fontStyle: 'italic',
    },
    mapContainer: {
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    footer: {
        padding: 14,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    acceptButton: {
        backgroundColor: COLORS.primaryLight,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});